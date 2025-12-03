// backend/src/wafer/wafer.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as poppler from 'pdf-poppler';
import axios from 'axios';
import { Readable } from 'stream';

export class WaferQueryParams {
  eqpId?: string;
  lotId?: string;
  waferId?: string | number;
  startDate?: string | Date;
  endDate?: string | Date;
  cassetteRcp?: string;
  stageRcp?: string;
  stageGroup?: string;
  film?: string;
  page?: string | number;
  pageSize?: string | number;
  servTs?: string | Date;
  ts?: string | Date;
  dateTime?: string | Date;
  pointNumber?: string | number;
}

interface StatsRawResult {
  [key: string]: number | null;
}

interface PdfResult {
  file_uri: string;
}

interface SpectrumRawResult {
  class: string;
  wavelengths: number[];
  values: number[];
}

// [수정] JOIN 결과에 맞게 인터페이스 수정
interface ResidualRawResult {
  point: number;
  x: number | null;
  y: number | null;
  class: string;
  values: number[];
}

interface GoldenRawResult {
  wavelengths: number[];
  values: number[];
}

export interface ResidualMapItem {
  point: number;
  x: number;
  y: number;
  residual: number;
}

@Injectable()
export class WaferService {
  constructor(private prisma: PrismaService) {}

  async getFlatData(params: WaferQueryParams) {
    const {
      eqpId,
      lotId,
      waferId,
      startDate,
      endDate,
      cassetteRcp,
      stageRcp,
      stageGroup,
      film,
      page = 0,
      pageSize = 20,
    } = params;

    let searchEnd: Date | undefined;
    if (endDate) {
      searchEnd = new Date(endDate);
      searchEnd.setDate(searchEnd.getDate() + 1);
    }

    const where: Prisma.PlgWfFlatWhereInput = {
      eqpid: eqpId || undefined,
      servTs: {
        gte: startDate ? new Date(startDate) : undefined,
        lt: searchEnd,
      },
      lotid: lotId ? { contains: lotId, mode: 'insensitive' } : undefined,
      waferid: waferId ? Number(waferId) : undefined,
      cassettercp: cassetteRcp || undefined,
      stagercp: stageRcp || undefined,
      stagegroup: stageGroup || undefined,
      film: film || undefined,
    };

    const uniqueGroupsPromise = this.prisma.plgWfFlat.groupBy({
      by: [
        'eqpid',
        'servTs',
        'lotid',
        'waferid',
        'cassettercp',
        'stagercp',
        'stagegroup',
        'film',
      ],
      where,
      _count: { _all: true },
    });

    const itemsPromise = this.prisma.plgWfFlat.findMany({
      where,
      take: Number(pageSize),
      skip: Number(page) * Number(pageSize),
      orderBy: [{ servTs: 'desc' }, { waferid: 'asc' }],
      distinct: [
        'eqpid',
        'servTs',
        'lotid',
        'waferid',
        'cassettercp',
        'stagercp',
        'stagegroup',
        'film',
      ],
      select: {
        eqpid: true,
        lotid: true,
        waferid: true,
        servTs: true,
        datetime: true,
        cassettercp: true,
        stagercp: true,
        stagegroup: true,
        film: true,
      },
    });

    const [uniqueGroups, items] = await this.prisma.$transaction([
      uniqueGroupsPromise,
      itemsPromise,
    ]);
    const total = uniqueGroups.length;

    return {
      totalItems: total,
      items: items.map((i) => ({
        eqpId: i.eqpid,
        lotId: i.lotid,
        waferId: i.waferid,
        servTs: i.servTs,
        dateTime: i.datetime,
        cassetteRcp: i.cassettercp,
        stageRcp: i.stagercp,
        stageGroup: i.stagegroup,
        film: i.film,
      })),
    };
  }

  async getPdfImage(params: WaferQueryParams): Promise<string> {
    const { eqpId, dateTime, pointNumber } = params;

    if (!eqpId || !dateTime || pointNumber === undefined) {
      throw new InternalServerErrorException(
        'EQP ID, DateTime, and PointNumber are required for PDF image.',
      );
    }

    const pdfCheckResult = await this.checkPdf({ eqpId, servTs: dateTime });
    if (!pdfCheckResult.exists || !pdfCheckResult.url) {
      throw new NotFoundException('PDF file URI not found in database.');
    }

    const dateObj = new Date(dateTime as string);
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const cacheFileName = `wafer_${eqpId}_${dateStr}_pt${pointNumber}.png`;
    const cacheFilePath = path.join(os.tmpdir(), cacheFileName);

    if (fs.existsSync(cacheFilePath)) {
      try {
        const imageBuffer = fs.readFileSync(cacheFilePath);
        return imageBuffer.toString('base64');
      } catch {
        /* ignore */
      }
    }

    let downloadUrl = pdfCheckResult.url;
    const baseUrl = process.env.PDF_SERVER_BASE_URL;

    if (baseUrl && !downloadUrl.startsWith('http')) {
      let normalizedPath = downloadUrl.replace(/\\/g, '/');
      if (!normalizedPath.startsWith('/'))
        normalizedPath = `/${normalizedPath}`;
      const normalizedBase = baseUrl.endsWith('/')
        ? baseUrl.slice(0, -1)
        : baseUrl;
      downloadUrl = `${normalizedBase}${normalizedPath}`;
    }

    const encodedUrl = encodeURI(downloadUrl);
    const tempId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const tempPdfPath = path.join(os.tmpdir(), `temp_wafer_${tempId}.pdf`);
    const outputPrefix = path.join(os.tmpdir(), `temp_img_${tempId}`);

    try {
      const writer = fs.createWriteStream(tempPdfPath);
      const response = await axios({
        url: encodedUrl,
        method: 'GET',
        responseType: 'stream',
        proxy: false,
      });

      (response.data as Readable).pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      const popplerBinPath =
        'F:\\Workspaces\\WEB\\ITM.Dashboard.Modern\\poppler-25.11.0\\Library\\bin';

      const targetPage = Number(pointNumber);

      const opts = {
        format: 'png',
        out_dir: os.tmpdir(),
        out_prefix: path.basename(outputPrefix),
        page: targetPage,
        binPath: popplerBinPath,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (poppler as any).convert(tempPdfPath, opts);

      const dirFiles = fs.readdirSync(os.tmpdir());
      const generatedImageName = dirFiles.find(
        (f) => f.startsWith(path.basename(outputPrefix)) && f.endsWith('.png'),
      );

      if (!generatedImageName) {
        throw new Error('Image generation failed.');
      }

      const generatedImagePath = path.join(os.tmpdir(), generatedImageName);

      try {
        fs.copyFileSync(generatedImagePath, cacheFilePath);
        fs.unlinkSync(generatedImagePath);
      } catch {
        /* ignore */
      }

      const finalPath = fs.existsSync(cacheFilePath)
        ? cacheFilePath
        : generatedImagePath;
      const imageBuffer = fs.readFileSync(finalPath);
      const base64Image = imageBuffer.toString('base64');

      try {
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
      } catch {
        /* ignore */
      }

      return base64Image;
    } catch (e) {
      try {
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
      } catch {
        /* ignore */
      }

      const error = e as { code?: string; message?: string };
      console.error(`[ERROR] PDF Processing Failed. URL: ${encodedUrl}`, e);
      throw new InternalServerErrorException(
        `Failed to process PDF image: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async getSpectrum(params: WaferQueryParams) {
    const { eqpId, lotId, waferId, pointNumber, ts } = params;

    if (!eqpId || !lotId || !waferId || pointNumber === undefined || !ts) {
      return [];
    }

    try {
      const targetDate = new Date(ts);
      const tsRaw = targetDate.toISOString();
      const tableName = 'public.plg_onto_spectrum';

      const results = await this.prisma.$queryRawUnsafe<SpectrumRawResult[]>(
        `SELECT class, wavelengths, values 
         FROM ${tableName}
         WHERE eqpid = $1 
           AND ts >= $2::timestamp - interval '2 second'
           AND ts <= $2::timestamp + interval '2 second'
           AND lotid = $3 
           AND waferid = $4 
           AND point = $5`,
        eqpId,
        tsRaw,
        lotId,
        String(waferId),
        Number(pointNumber),
      );

      if (!results || results.length === 0) {
        return [];
      }

      return results.map((r) => ({
        class: r.class,
        wavelengths: r.wavelengths,
        values: r.values,
      }));
    } catch (e) {
      console.error('[WaferService] Error fetching spectrum data:', e);
      return [];
    }
  }

  async getStatistics(params: WaferQueryParams) {
    const whereSql = this.buildUniqueWhere(params);
    if (!whereSql) return this.getEmptyStatistics();

    try {
      const result = await this.prisma.$queryRawUnsafe<StatsRawResult[]>(`
        SELECT
          MAX(t1) as t1_max, MIN(t1) as t1_min, AVG(t1) as t1_mean, STDDEV_SAMP(t1) as t1_std,
          MAX(gof) as gof_max, MIN(gof) as gof_min, AVG(gof) as gof_mean, STDDEV_SAMP(gof) as gof_std,
          MAX(z) as z_max, MIN(z) as z_min, AVG(z) as z_mean, STDDEV_SAMP(z) as z_std,
          MAX(srvisz) as s_max, MIN(srvisz) as s_min, AVG(srvisz) as s_mean, STDDEV_SAMP(srvisz) as s_std
        FROM public.plg_wf_flat
        ${whereSql}
        LIMIT 1
      `);

      const row = result[0] || ({} as StatsRawResult);
      if (row.t1_max === null) return this.getEmptyStatistics();

      const createStatItem = (prefix: string) => {
        const max = Number(row[`${prefix}_max`] || 0);
        const min = Number(row[`${prefix}_min`] || 0);
        const mean = Number(row[`${prefix}_mean`] || 0);
        const std = Number(row[`${prefix}_std`] || 0);
        const range = max - min;
        return {
          max,
          min,
          range,
          mean,
          stdDev: std,
          percentStdDev: mean !== 0 ? (std / mean) * 100 : 0,
          percentNonU: mean !== 0 ? (range / (2 * mean)) * 100 : 0,
        };
      };

      return {
        t1: createStatItem('t1'),
        gof: createStatItem('gof'),
        z: createStatItem('z'),
        srvisz: createStatItem('s'),
      };
    } catch (e) {
      console.error('Error in getStatistics:', e);
      return this.getEmptyStatistics();
    }
  }

  async getPointData(
    params: WaferQueryParams,
  ): Promise<{ headers: string[]; data: unknown[][] }> {
    const whereSql = this.buildUniqueWhere(params);
    if (!whereSql) return { headers: [], data: [] };

    try {
      const rawData = await this.prisma.$queryRawUnsafe<
        Record<string, unknown>[]
      >(`
        SELECT * FROM public.plg_wf_flat ${whereSql} ORDER BY point
      `);

      if (!rawData || rawData.length === 0) return { headers: [], data: [] };

      const excludeCols = new Set([
        'eqpid',
        'lotid',
        'waferid',
        'serv_ts',
        'cassettercp',
        'stagercp',
        'stagegroup',
        'film',
        'datetime',
      ]);
      const allKeys = new Set<string>();
      rawData.forEach((row) => {
        Object.keys(row).forEach((k) => {
          if (!excludeCols.has(k) && row[k] !== null) allKeys.add(k);
        });
      });

      const customOrder = [
        'point',
        'mse',
        't1',
        'gof',
        'x',
        'y',
        'diex',
        'diey',
        'dierow',
        'diecol',
        'dienum',
        'diepointtag',
        'z',
        'srvisz',
      ];
      const headers = Array.from(allKeys).sort((a, b) => {
        const lowerA = a.toLowerCase();
        const lowerB = b.toLowerCase();
        const idxA = customOrder.indexOf(lowerA);
        const idxB = customOrder.indexOf(lowerB);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return lowerA.localeCompare(lowerB);
      });

      const data = rawData.map((row) => headers.map((h) => row[h]));
      return { headers, data };
    } catch (e) {
      console.error('Error in getPointData:', e);
      return { headers: [], data: [] };
    }
  }

  async checkPdf(params: WaferQueryParams) {
    const { eqpId, servTs } = params;
    if (!eqpId || !servTs) return { exists: false, url: null };

    try {
      const ts = typeof servTs === 'string' ? servTs : servTs.toISOString();
      const result = await this.prisma.$queryRawUnsafe<PdfResult[]>(
        `SELECT file_uri FROM public.plg_wf_map 
         WHERE eqpid = $1 
           AND datetime >= $2::timestamp - interval '24 hours'
           AND datetime <= $2::timestamp + interval '24 hours'
         LIMIT 1`,
        eqpId,
        ts,
      );

      if (result && result.length > 0 && result[0].file_uri) {
        return { exists: true, url: result[0].file_uri };
      }
    } catch (e) {
      console.warn(`Failed to check PDF for ${String(eqpId)}:`, e);
    }
    return { exists: false, url: null };
  }

  async getResidualMap(params: WaferQueryParams): Promise<ResidualMapItem[]> {
    const { eqpId, lotId, waferId, ts } = params;
    if (!eqpId || !lotId || !waferId || !ts) return [];

    const targetDate = new Date(ts);
    const tsRaw = targetDate.toISOString();

    // [오류 해결 1] x, y 컬럼이 없는 문제를 해결하기 위해 plg_wf_flat과 JOIN
    // [오류 해결 2] waferid 타입 불일치(varchar vs int) 해결을 위해 ::varchar 형변환 추가
    const rawData = await this.prisma.$queryRawUnsafe<ResidualRawResult[]>(
      `SELECT s.point, f.x, f.y, s.class, s.values 
       FROM public.plg_onto_spectrum s
       JOIN public.plg_wf_flat f 
         ON s.eqpid = f.eqpid 
         AND s.lotid = f.lotid 
         AND s.waferid = f.waferid::varchar 
         AND s.point = f.point
       WHERE s.eqpid = $1 
         AND s.ts >= $2::timestamp - interval '2 second'
         AND s.ts <= $2::timestamp + interval '2 second'
         AND f.serv_ts >= $2::timestamp - interval '5 second'
         AND f.serv_ts <= $2::timestamp + interval '5 second'
         AND s.lotid = $3 
         AND s.waferid = $4`,
      eqpId,
      tsRaw,
      lotId,
      String(waferId),
    );

    const mapData: Map<
      number,
      { exp: number[]; gen: number[]; x: number; y: number }
    > = new Map();

    rawData.forEach((r) => {
      if (!mapData.has(r.point)) {
        mapData.set(r.point, {
          exp: [],
          gen: [],
          x: r.x || 0,
          y: r.y || 0,
        });
      }
      const item = mapData.get(r.point);
      if (item) {
        if (r.class.toLowerCase() === 'exp') item.exp = r.values || [];
        if (r.class.toLowerCase() === 'gen') item.gen = r.values || [];
      }
    });

    const result: ResidualMapItem[] = [];
    mapData.forEach((val, point) => {
      if (
        val.exp.length > 0 &&
        val.gen.length > 0 &&
        val.exp.length === val.gen.length
      ) {
        const sumDiff = val.exp.reduce(
          (acc, curr, idx) => acc + Math.abs(curr - val.gen[idx]),
          0,
        );
        result.push({ point, x: val.x, y: val.y, residual: sumDiff });
      }
    });

    return result;
  }

  async getGoldenSpectrum(params: WaferQueryParams) {
    const { eqpId, cassetteRcp, stageGroup, film } = params;

    // [오류 해결 2] waferid 타입 불일치(varchar vs int) 해결을 위해 ::varchar 형변환 추가
    const samples = await this.prisma.$queryRawUnsafe<GoldenRawResult[]>(
      `SELECT s.wavelengths, s.values
       FROM public.plg_onto_spectrum s
       JOIN public.plg_wf_flat f 
         ON s.eqpid = f.eqpid AND s.lotid = f.lotid AND s.waferid = f.waferid::varchar AND s.point = f.point
       WHERE s.class = 'exp'
         AND f.eqpid = $1
         AND f.cassettercp = $2
         AND f.stagegroup = $3
         AND f.film = $4
         AND f.gof >= 0.98
         AND f.serv_ts >= NOW() - INTERVAL '7 days'
       LIMIT 50`,
      eqpId,
      cassetteRcp || '',
      stageGroup || '',
      film || '',
    );

    if (samples.length === 0) return null;

    const baseWavelengths = samples[0].wavelengths;
    const valueSums: number[] = Array.from(
      { length: baseWavelengths.length },
      () => 0,
    );
    let count = 0;

    samples.forEach((sample) => {
      if (sample.values && sample.values.length === baseWavelengths.length) {
        sample.values.forEach((v: number, i: number) => (valueSums[i] += v));
        count++;
      }
    });

    if (count === 0) return null;

    return {
      wavelengths: baseWavelengths,
      values: valueSums.map((v) => v / count),
    };
  }

  private buildUniqueWhere(p: WaferQueryParams): string | null {
    if (!p.eqpId) return null;
    let sql = `WHERE eqpid = '${String(p.eqpId)}'`;

    if (p.servTs) {
      const ts =
        typeof p.servTs === 'string' ? p.servTs : p.servTs.toISOString();
      sql += ` AND serv_ts >= '${ts}'::timestamp - interval '24 hours'`;
      sql += ` AND serv_ts <= '${ts}'::timestamp + interval '24 hours'`;
    }

    if (p.lotId) sql += ` AND lotid = '${String(p.lotId)}'`;
    if (p.waferId) sql += ` AND waferid = ${Number(p.waferId)}`;
    if (p.cassetteRcp) sql += ` AND cassettercp = '${String(p.cassetteRcp)}'`;
    if (p.stageRcp) sql += ` AND stagercp = '${String(p.stageRcp)}'`;
    if (p.stageGroup) sql += ` AND stagegroup = '${String(p.stageGroup)}'`;
    if (p.film) sql += ` AND film = '${String(p.film)}'`;
    return sql;
  }

  private getEmptyStatistics() {
    const emptyItem = {
      max: 0,
      min: 0,
      range: 0,
      mean: 0,
      stdDev: 0,
      percentStdDev: 0,
      percentNonU: 0,
    };
    return { t1: emptyItem, gof: emptyItem, z: emptyItem, srvisz: emptyItem };
  }
}

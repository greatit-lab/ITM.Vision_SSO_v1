// backend/src/wafer/wafer.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
  ts?: string | Date; // [추가] EQP Time 파라미터
  dateTime?: string | Date;
  pointNumber?: string | number;
}

interface StatsRawResult {
  [key: string]: number | null;
}

interface PdfResult {
  file_uri: string;
}

// 스펙트럼 데이터 결과 인터페이스
interface SpectrumRawResult {
  class: string;       // 'exp' | 'gen'
  wavelengths: number[];
  values: number[];
}

@Injectable()
export class WaferService {
  constructor(private prisma: PrismaService) {}

  async getFlatData(params: WaferQueryParams) {
    const {
      eqpId, lotId, waferId, startDate, endDate, cassetteRcp, stageRcp, stageGroup, film,
      page = 0, pageSize = 20,
    } = params;

    const where: Prisma.PlgWfFlatWhereInput = {
      eqpid: eqpId || undefined,
      servTs: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      lotid: lotId ? { contains: lotId, mode: 'insensitive' } : undefined,
      waferid: waferId ? Number(waferId) : undefined,
      cassettercp: cassetteRcp || undefined,
      stagercp: stageRcp || undefined,
      stagegroup: stageGroup || undefined,
      film: film || undefined,
    };

    const uniqueGroupsPromise = this.prisma.plgWfFlat.groupBy({
      by: ['eqpid', 'servTs', 'lotid', 'waferid', 'cassettercp', 'stagercp', 'stagegroup', 'film'],
      where,
      _count: { _all: true },
    });

    const itemsPromise = this.prisma.plgWfFlat.findMany({
      where,
      take: Number(pageSize),
      skip: Number(page) * Number(pageSize),
      orderBy: [{ servTs: 'desc' }, { waferid: 'asc' }],
      distinct: ['eqpid', 'servTs', 'lotid', 'waferid', 'cassettercp', 'stagercp', 'stagegroup', 'film'],
      select: {
        eqpid: true, lotid: true, waferid: true, servTs: true, datetime: true,
        cassettercp: true, stagercp: true, stagegroup: true, film: true,
      },
    });

    const [uniqueGroups, items] = await this.prisma.$transaction([uniqueGroupsPromise, itemsPromise]);
    const total = uniqueGroups.length;

    return {
      totalItems: total,
      items: items.map((i) => ({
        eqpId: i.eqpid, lotId: i.lotid, waferId: i.waferid, servTs: i.servTs, dateTime: i.datetime,
        cassetteRcp: i.cassettercp, stageRcp: i.stagercp, stageGroup: i.stagegroup, film: i.film,
      })),
    };
  }

  async getPdfImage(params: WaferQueryParams): Promise<string> {
    const { eqpId, dateTime, pointNumber } = params;

    if (!eqpId || !dateTime || pointNumber === undefined) {
      throw new InternalServerErrorException('EQP ID, DateTime, and PointNumber are required for PDF image.');
    }

    // 1. DB에서 파일 경로 조회
    const pdfCheckResult = await this.checkPdf({ eqpId, servTs: dateTime });
    if (!pdfCheckResult.exists || !pdfCheckResult.url) {
      throw new NotFoundException('PDF file URI not found in database.');
    }

    // [캐싱] 파일명 규칙 생성 (YYYYMMDD)
    const dateObj = new Date(dateTime as string);
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const cacheFileName = `wafer_${eqpId}_${dateStr}_pt${pointNumber}.png`;
    const cacheFilePath = path.join(os.tmpdir(), cacheFileName);

    // [캐싱] 파일이 존재하면 바로 반환
    if (fs.existsSync(cacheFilePath)) {
      try {
        const imageBuffer = fs.readFileSync(cacheFilePath);
        return imageBuffer.toString('base64');
      } catch { /* 읽기 실패 시 무시 */ }
    }

    // URL 조합 및 인코딩
    let downloadUrl = pdfCheckResult.url;
    const baseUrl = process.env.PDF_SERVER_BASE_URL;

    if (baseUrl && !downloadUrl.startsWith('http')) {
      let normalizedPath = downloadUrl.replace(/\\/g, '/');
      if (!normalizedPath.startsWith('/')) normalizedPath = `/${normalizedPath}`;
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      downloadUrl = `${normalizedBase}${normalizedPath}`;
    }

    const encodedUrl = encodeURI(downloadUrl);

    // 임시 파일 경로
    const tempId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const tempPdfPath = path.join(os.tmpdir(), `temp_wafer_${tempId}.pdf`);
    const outputPrefix = path.join(os.tmpdir(), `temp_img_${tempId}`);

    try {
      const writer = fs.createWriteStream(tempPdfPath);
      const response = await axios({
        url: encodedUrl,
        method: 'GET',
        responseType: 'stream',
        proxy: false, // 로컬 접속 시 프록시 우회
      });

      (response.data as Readable).pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      // Poppler 실행 옵션
      const popplerBinPath = 'F:\\Workspaces\\WEB\\ITM.Dashboard.Modern\\poppler-25.11.0\\Library\\bin';
      
      const targetPage = Number(pointNumber); 

      const opts = {
        format: 'png',
        out_dir: os.tmpdir(),
        out_prefix: path.basename(outputPrefix),
        page: targetPage,
        binPath: popplerBinPath,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      await (poppler as any).convert(tempPdfPath, opts);

      // 생성된 이미지 찾기
      const dirFiles = fs.readdirSync(os.tmpdir());
      const generatedImageName = dirFiles.find(
        (f) => f.startsWith(path.basename(outputPrefix)) && f.endsWith('.png')
      );

      if (!generatedImageName) {
        throw new Error('Image generation failed.');
      }

      const generatedImagePath = path.join(os.tmpdir(), generatedImageName);

      // [캐싱] 생성된 이미지를 캐시 이름으로 저장
      try {
        fs.copyFileSync(generatedImagePath, cacheFilePath);
        fs.unlinkSync(generatedImagePath);
      } catch { /* 복사 실패 시 원본 사용 */ }

      // 최종 파일 읽기
      const finalPath = fs.existsSync(cacheFilePath) ? cacheFilePath : generatedImagePath;
      const imageBuffer = fs.readFileSync(finalPath);
      const base64Image = imageBuffer.toString('base64');

      // PDF 원본 삭제
      try {
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
      } catch { /* ignore */ }

      return base64Image;

    } catch (e) {
      try {
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
      } catch { /* ignore */ }

      const error = e as { code?: string; message?: string };
      console.error(`[ERROR] PDF Processing Failed. URL: ${encodedUrl}`, e);
      throw new InternalServerErrorException(
        `Failed to process PDF image: ${error.message || 'Unknown error'}`
      );
    }
  }

  // ▼▼▼ [수정] Spectrum 데이터 조회: 'ts' 파라미터 사용 ▼▼▼
  async getSpectrum(params: WaferQueryParams) {
    // [수정] servTs -> ts 로 변경
    const { eqpId, lotId, waferId, pointNumber, ts } = params;

    // 필수 파라미터 체크
    if (!eqpId || !lotId || !waferId || pointNumber === undefined || !ts) {
      return [];
    }

    try {
      const targetDate = new Date(ts as string | Date);
      const now = new Date();

      // SQL 쿼리용 원본 문자열 (중심 시간)
      const tsRaw = typeof ts === 'string' ? ts : targetDate.toISOString();

      let tableName = 'public.plg_onto_spectrum'; 

      const isCurrentMonth = 
        targetDate.getFullYear() === now.getFullYear() && 
        targetDate.getMonth() === now.getMonth();

      if (!isCurrentMonth) {
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        tableName = `public.plg_onto_spectrum_y${year}m${month}`;
      }

      // [수정] ts 컬럼 사용 + ±1초 범위 검색
      const results = await this.prisma.$queryRawUnsafe<SpectrumRawResult[]>(
        `SELECT class, wavelengths, values 
         FROM ${tableName}
         WHERE eqpid = $1 
           AND ts >= $2::timestamp - interval '1 second'
           AND ts <= $2::timestamp + interval '1 second'
           AND lotid = $3 
           AND waferid = $4 
           AND point = $5`,
        eqpId,
        tsRaw, 
        lotId,
        Number(waferId),
        Number(pointNumber)
      );

      if (!results || results.length === 0) return [];

      return results.map(r => ({
        class: r.class,
        wavelengths: r.wavelengths,
        values: r.values
      }));

    } catch (e) {
      console.error('Error fetching spectrum data:', e);
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
          max, min, range, mean, stdDev: std,
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

  async getPointData(params: WaferQueryParams): Promise<{ headers: string[]; data: unknown[][] }> {
    const whereSql = this.buildUniqueWhere(params);
    if (!whereSql) return { headers: [], data: [] };

    try {
      const rawData = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
        SELECT * FROM public.plg_wf_flat ${whereSql} ORDER BY point
      `);

      if (!rawData || rawData.length === 0) return { headers: [], data: [] };

      const excludeCols = new Set(['eqpid', 'lotid', 'waferid', 'serv_ts', 'cassettercp', 'stagercp', 'stagegroup', 'film', 'datetime']);
      const allKeys = new Set<string>();
      rawData.forEach((row) => {
        Object.keys(row).forEach((k) => {
          if (!excludeCols.has(k) && row[k] !== null) allKeys.add(k);
        });
      });

      const customOrder = ['point', 'mse', 't1', 'gof', 'x', 'y', 'diex', 'diey', 'dierow', 'diecol', 'dienum', 'diepointtag', 'z', 'srvisz'];
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
        eqpId, ts
      );

      if (result && result.length > 0 && result[0].file_uri) {
        return { exists: true, url: result[0].file_uri };
      }
    } catch (e) {
      console.warn(`Failed to check PDF for ${String(eqpId)}:`, e);
    }
    return { exists: false, url: null };
  }

  private buildUniqueWhere(p: WaferQueryParams): string | null {
    if (!p.eqpId) return null;
    let sql = `WHERE eqpid = '${String(p.eqpId)}'`;

    if (p.servTs) {
      const ts = typeof p.servTs === 'string' ? p.servTs : p.servTs.toISOString();
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
    const emptyItem = { max: 0, min: 0, range: 0, mean: 0, stdDev: 0, percentStdDev: 0, percentNonU: 0 };
    return { t1: emptyItem, gof: emptyItem, z: emptyItem, srvisz: emptyItem };
  }
}

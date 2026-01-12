// backend/src/wafer/wafer.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [중요] TS1272 방지 및 Validation을 위해 Class로 DTO 정의
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
  pointId?: string;
  waferIds?: string;
  metric?: string;
  site?: string;
  sdwt?: string;
  targetEqps?: string;
  [key: string]: any; // 인덱스 시그니처 추가
}

// Interfaces for Responses
export interface ResidualMapItem {
  point: number;
  x: number;
  y: number;
  residual: number;
}
export interface ComparisonRawResult {
  eqpid: string;
  lotid: string;
  waferid: number;
  point: number;
  [key: string]: string | number | null;
}
export interface SpectrumTrendSeries {
  name: string;
  waferId: number;
  pointId: number;
  meta: Record<string, unknown>;
  data: number[][];
}
export interface SpectrumGenResponse {
  name: string;
  type: string;
  lineStyle: { type: string; width: number; color: string };
  data: number[][];
  symbol: string;
}
export interface FlatDataResponse {
  totalItems: number;
  items: Array<{
    eqpId: string;
    lotId: string;
    waferId: number;
    servTs: Date | string;
    dateTime: Date | string;
    cassetteRcp: string;
    stageRcp: string;
    stageGroup: string;
    film: string;
  }>;
}
export interface PdfCheckResponse {
  exists: boolean;
  url: string | null;
}
export interface PdfImageResponse {
  image: string;
}
export interface GoldenSpectrumResponse {
  wavelengths: number[];
  values: number[];
}
export interface LotUniformityTrendSeries {
  waferId: number;
  dataPoints: {
    point: number;
    value: number;
    x: number;
    y: number;
    dieRow: number | null;
    dieCol: number | null;
  }[];
}
export interface OpticalTrendResponse {
  ts: string;
  lotId: string;
  waferId: string;
  point: number;
  totalIntensity: number;
  peakIntensity: number;
  peakWavelength: number;
  darkNoise: number;
}
export interface SpectrumRawResult {
  class: string;
  wavelengths: number[];
  values: number[];
}

@Injectable()
export class WaferService {
  private readonly DOMAIN = 'wafer';

  constructor(private readonly api: DataApiService) {}

  /**
   * 파라미터 정제 (Date -> String 등)
   */
  private cleanParams(params: WaferQueryParams): Record<string, any> {
    const clean: Record<string, any> = {};
    const entries = Object.entries(params);

    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          clean[key] = value.toISOString();
        } else if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          clean[key] = String(value);
        } else {
          clean[key] = JSON.stringify(value);
        }
      }
    }
    return clean;
  }

  // --- API Methods ---

  async getFlatData(params: WaferQueryParams): Promise<FlatDataResponse> {
    return this.api.request<FlatDataResponse>(
      this.DOMAIN,
      'get',
      'flat-data',
      undefined,
      this.cleanParams(params),
    ) as Promise<FlatDataResponse>;
  }

  async getDistinctValues(
    column: string,
    params: WaferQueryParams,
  ): Promise<string[]> {
    const query = { ...params, field: column };
    return this.api.request<string[]>(
      this.DOMAIN,
      'get',
      'distinct-values',
      undefined,
      this.cleanParams(query),
      { returnNullOn404: true },
    ).then((res) => res || []);
  }

  async getDistinctPoints(params: WaferQueryParams): Promise<string[]> {
    return this.api.request<string[]>(
      this.DOMAIN,
      'get',
      'distinct-points',
      undefined,
      this.cleanParams(params),
      { returnNullOn404: true },
    ).then((res) => res || []);
  }

  async getSpectrumTrend(
    params: WaferQueryParams,
  ): Promise<SpectrumTrendSeries[]> {
    return this.api.request<SpectrumTrendSeries[]>(
      this.DOMAIN,
      'get',
      'spectrum-trend',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || []);
  }

  async getSpectrumGen(
    params: WaferQueryParams,
  ): Promise<SpectrumGenResponse | null> {
    return this.api.request<SpectrumGenResponse | null>(
      this.DOMAIN,
      'get',
      'spectrum-gen',
      undefined,
      this.cleanParams(params),
    );
  }

  async getPdfImage(params: WaferQueryParams): Promise<string> {
    const res = await this.api.request<PdfImageResponse>(
      this.DOMAIN,
      'get',
      'pdf-image',
      undefined,
      this.cleanParams(params),
    );
    return res ? res.image : '';
  }

  async checkPdf(params: WaferQueryParams): Promise<PdfCheckResponse> {
    return this.api.request<PdfCheckResponse>(
      this.DOMAIN,
      'get',
      'check-pdf',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || { exists: false, url: null });
  }

  async getSpectrum(params: WaferQueryParams): Promise<SpectrumRawResult[]> {
    return this.api.request<SpectrumRawResult[]>(
      this.DOMAIN,
      'get',
      'spectrum',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || []);
  }

  async getStatistics(params: WaferQueryParams): Promise<any> {
    return this.api.request<any>(
      this.DOMAIN,
      'get',
      'statistics',
      undefined,
      this.cleanParams(params),
    );
  }

  async getPointData(
    params: WaferQueryParams,
  ): Promise<{ headers: string[]; data: unknown[][] }> {
    return this.api.request<{ headers: string[]; data: unknown[][] }>(
      this.DOMAIN,
      'get',
      'point-data',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || { headers: [], data: [] });
  }

  async getResidualMap(params: WaferQueryParams): Promise<ResidualMapItem[]> {
    return this.api.request<ResidualMapItem[]>(
      this.DOMAIN,
      'get',
      'residual-map',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || []);
  }

  async getGoldenSpectrum(
    params: WaferQueryParams,
  ): Promise<GoldenSpectrumResponse | null> {
    return this.api.request<GoldenSpectrumResponse | null>(
      this.DOMAIN,
      'get',
      'golden-spectrum',
      undefined,
      this.cleanParams(params),
    );
  }

  async getAvailableMetrics(params: WaferQueryParams): Promise<string[]> {
    return this.api.request<string[]>(
      this.DOMAIN,
      'get',
      'available-metrics',
      undefined,
      this.cleanParams(params),
      { returnNullOn404: true },
    ).then((res) => res || []);
  }

  async getLotUniformityTrend(
    params: WaferQueryParams & { metric: string },
  ): Promise<LotUniformityTrendSeries[]> {
    return this.api.request<LotUniformityTrendSeries[]>(
      this.DOMAIN,
      'get',
      'lot-uniformity-trend',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || []);
  }

  async getMatchingEquipments(params: WaferQueryParams): Promise<string[]> {
    return this.api.request<string[]>(
      this.DOMAIN,
      'get',
      'matching-equipments',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || []);
  }

  async getComparisonData(
    params: WaferQueryParams,
  ): Promise<ComparisonRawResult[]> {
    return this.api.request<ComparisonRawResult[]>(
      this.DOMAIN,
      'get',
      'comparison-data',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || []);
  }

  async getOpticalTrend(
    params: WaferQueryParams,
  ): Promise<OpticalTrendResponse[]> {
    return this.api.request<OpticalTrendResponse[]>(
      this.DOMAIN,
      'get',
      'optical-trend',
      undefined,
      this.cleanParams(params),
    ).then((res) => res || []);
  }
}

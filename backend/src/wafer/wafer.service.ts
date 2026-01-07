// backend/src/wafer/wafer.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// --- DTO & Interfaces ---
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
}

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
  private readonly logger = new Logger(WaferService.name);
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/wafer';

  constructor(private readonly httpService: HttpService) {}

  /**
   * [Core] ESLint 오류 해결 및 404 방지 로직 (Proxy 우회 포함)
   */
  private async fetchFromApi<T>(
    endpoint: string,
    params: WaferQueryParams,
  ): Promise<T> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = `${this.DATA_API_BASE}/${endpoint}`;

      // [ESLint 해결] Record<string, unknown>을 사용하여 타입 안정성 확보
      const cleanParams: Record<string, string | number> = {};
      const rawEntries = Object.entries(
        params as unknown as Record<string, unknown>,
      );

      rawEntries.forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            cleanParams[key] = value.toISOString();
          } else {
            cleanParams[key] = String(value);
          }
        }
      });

      // 404 디버깅을 위해 Axios가 생성할 실제 URL을 미리 파악
      const dummyConfig: InternalAxiosRequestConfig = {
        params: cleanParams,
        url: targetPath,
      } as InternalAxiosRequestConfig;
      finalUrl = axios.getUri(dummyConfig);

      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get<T>(targetPath, {
          params: cleanParams,
          // [중요] 시스템 프록시 설정을 무시하고 직접 연결 (404 해결 핵심)
          proxy: false,
          headers: {
            Accept: 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          timeout: 10000,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Unknown Error';
      let statusCode = 500;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        statusCode = axiosError.response?.status || 500;

        // [ESLint 해결] any 데이터 캐스팅 및 문자열 처리
        const errorData = axiosError.response?.data;
        errorMessage = errorData
          ? JSON.stringify(errorData)
          : axiosError.message;

        this.logger.error(
          `[Data API Error] ${statusCode} - Failed URL: ${finalUrl}`,
        );
      }

      if (
        statusCode === 404 &&
        ['distinct-values', 'available-metrics', 'points'].includes(endpoint)
      ) {
        return [] as unknown as T;
      }

      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }

  // --- API Methods (전체 코드 유지) ---

  async getFlatData(params: WaferQueryParams): Promise<FlatDataResponse> {
    return this.fetchFromApi<FlatDataResponse>('flat-data', params);
  }

  async getDistinctValues(
    column: string,
    params: WaferQueryParams,
  ): Promise<string[]> {
    // 린트 준수를 위한 타입 단언 사용
    const query = { ...params, field: column } as unknown as WaferQueryParams;
    return this.fetchFromApi<string[]>('distinct-values', query);
  }

  async getDistinctPoints(params: WaferQueryParams): Promise<string[]> {
    return this.fetchFromApi<string[]>('distinct-points', params);
  }

  async getSpectrumTrend(
    params: WaferQueryParams,
  ): Promise<SpectrumTrendSeries[]> {
    return this.fetchFromApi<SpectrumTrendSeries[]>('spectrum-trend', params);
  }

  async getSpectrumGen(
    params: WaferQueryParams,
  ): Promise<SpectrumGenResponse | null> {
    return this.fetchFromApi<SpectrumGenResponse | null>(
      'spectrum-gen',
      params,
    );
  }

  async getPdfImage(params: WaferQueryParams): Promise<string> {
    const res = await this.fetchFromApi<PdfImageResponse>('pdf-image', params);
    return res.image;
  }

  async checkPdf(params: WaferQueryParams): Promise<PdfCheckResponse> {
    return this.fetchFromApi<PdfCheckResponse>('check-pdf', params);
  }

  async getSpectrum(params: WaferQueryParams): Promise<SpectrumRawResult[]> {
    return this.fetchFromApi<SpectrumRawResult[]>('spectrum', params);
  }

  async getStatistics(params: WaferQueryParams): Promise<any> {
    return this.fetchFromApi<any>('statistics', params);
  }

  async getPointData(
    params: WaferQueryParams,
  ): Promise<{ headers: string[]; data: unknown[][] }> {
    return this.fetchFromApi<{ headers: string[]; data: unknown[][] }>(
      'point-data',
      params,
    );
  }

  async getResidualMap(params: WaferQueryParams): Promise<ResidualMapItem[]> {
    return this.fetchFromApi<ResidualMapItem[]>('residual-map', params);
  }

  async getGoldenSpectrum(
    params: WaferQueryParams,
  ): Promise<GoldenSpectrumResponse | null> {
    return this.fetchFromApi<GoldenSpectrumResponse | null>(
      'golden-spectrum',
      params,
    );
  }

  async getAvailableMetrics(params: WaferQueryParams): Promise<string[]> {
    return this.fetchFromApi<string[]>('available-metrics', params);
  }

  async getLotUniformityTrend(
    params: WaferQueryParams & { metric: string },
  ): Promise<LotUniformityTrendSeries[]> {
    return this.fetchFromApi<LotUniformityTrendSeries[]>(
      'lot-uniformity-trend',
      params,
    );
  }

  async getMatchingEquipments(params: WaferQueryParams): Promise<string[]> {
    return this.fetchFromApi<string[]>('matching-equipments', params);
  }

  async getComparisonData(
    params: WaferQueryParams,
  ): Promise<ComparisonRawResult[]> {
    return this.fetchFromApi<ComparisonRawResult[]>('comparison-data', params);
  }

  async getOpticalTrend(
    params: WaferQueryParams,
  ): Promise<OpticalTrendResponse[]> {
    return this.fetchFromApi<OpticalTrendResponse[]>('optical-trend', params);
  }
}

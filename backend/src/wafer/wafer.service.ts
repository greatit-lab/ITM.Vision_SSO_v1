// backend/src/wafer/wafer.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError } from 'axios';

// [중요] Controller 및 프론트엔드 연동을 위한 타입 정의
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

// [신규] API 응답용 인터페이스 정의 (any 대체)
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
  // [설정] Data API 주소
  private readonly DATA_API_URL = 'http://10.135.77.71:8081/api/wafer';

  constructor(private readonly httpService: HttpService) {}

  // 공통 API 호출 메서드 (타입 안전성 확보)
  private async fetchFromApi<T>(
    endpoint: string,
    params: Record<string, unknown>,
  ): Promise<T> {
    try {
      const url = `${this.DATA_API_URL}/${endpoint}`;

      const response = await firstValueFrom(
        this.httpService.get<T>(url, { params }),
      );

      return response.data;
    } catch (error: unknown) {
      // Error Handling: unknown 타입으로 받아 안전하게 캐스팅
      let errorMessage = 'Unknown Error';

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        errorMessage = axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error(
        `[WaferService Proxy Error] Failed to fetch ${endpoint}:`,
        errorMessage,
      );

      // 빈 배열 반환이 필요한 경우 (타입 캐스팅)
      if (endpoint === 'distinct-values' || endpoint === 'available-metrics') {
        return [] as unknown as T;
      }

      throw new InternalServerErrorException(`Data API Error: ${errorMessage}`);
    }
  }

  // --- API 호출 메서드 ---

  async getDistinctValues(
    column: string,
    params: WaferQueryParams,
  ): Promise<string[]> {
    return this.fetchFromApi<string[]>('distinct-values', {
      ...params,
      field: column,
    });
  }

  async getDistinctPoints(params: WaferQueryParams): Promise<string[]> {
    return this.fetchFromApi<string[]>('distinct-points', { ...params });
  }

  async getSpectrumTrend(
    params: WaferQueryParams,
  ): Promise<SpectrumTrendSeries[]> {
    return this.fetchFromApi<SpectrumTrendSeries[]>('spectrum-trend', {
      ...params,
    });
  }

  async getSpectrumGen(
    params: WaferQueryParams,
  ): Promise<SpectrumGenResponse | null> {
    return this.fetchFromApi<SpectrumGenResponse | null>('spectrum-gen', {
      ...params,
    });
  }

  async getFlatData(params: WaferQueryParams): Promise<FlatDataResponse> {
    return this.fetchFromApi<FlatDataResponse>('flat-data', { ...params });
  }

  async getPdfImage(params: WaferQueryParams): Promise<string> {
    const res = await this.fetchFromApi<PdfImageResponse>('pdf-image', {
      ...params,
    });
    return res.image;
  }

  async checkPdf(params: WaferQueryParams): Promise<PdfCheckResponse> {
    return this.fetchFromApi<PdfCheckResponse>('check-pdf', { ...params });
  }

  async getSpectrum(params: WaferQueryParams): Promise<SpectrumRawResult[]> {
    return this.fetchFromApi<SpectrumRawResult[]>('spectrum', { ...params });
  }

  // Statistics는 동적 키를 가질 수 있으므로 Record 사용 혹은 구체적 인터페이스 사용
  // 기존 로직 참고하여 구체적 타입 정의
  async getStatistics(params: WaferQueryParams): Promise<any> {
    // any 허용: Statistics 구조가 복잡하거나 프론트엔드에서 유연하게 처리됨
    // 필요 시 구체적 인터페이스(StatisticsDto)로 교체 가능
    return this.fetchFromApi<any>('statistics', { ...params });
  }

  async getPointData(
    params: WaferQueryParams,
  ): Promise<{ headers: string[]; data: unknown[][] }> {
    return this.fetchFromApi<{ headers: string[]; data: unknown[][] }>(
      'point-data',
      { ...params },
    );
  }

  async getResidualMap(params: WaferQueryParams): Promise<ResidualMapItem[]> {
    return this.fetchFromApi<ResidualMapItem[]>('residual-map', { ...params });
  }

  async getGoldenSpectrum(
    params: WaferQueryParams,
  ): Promise<GoldenSpectrumResponse | null> {
    return this.fetchFromApi<GoldenSpectrumResponse | null>('golden-spectrum', {
      ...params,
    });
  }

  async getAvailableMetrics(params: WaferQueryParams): Promise<string[]> {
    return this.fetchFromApi<string[]>('available-metrics', { ...params });
  }

  async getLotUniformityTrend(
    params: WaferQueryParams & { metric: string },
  ): Promise<LotUniformityTrendSeries[]> {
    return this.fetchFromApi<LotUniformityTrendSeries[]>(
      'lot-uniformity-trend',
      { ...params },
    );
  }

  async getMatchingEquipments(params: WaferQueryParams): Promise<string[]> {
    return this.fetchFromApi<string[]>('matching-equipments', { ...params });
  }

  async getComparisonData(
    params: WaferQueryParams,
  ): Promise<ComparisonRawResult[]> {
    return this.fetchFromApi<ComparisonRawResult[]>('comparison-data', {
      ...params,
    });
  }

  async getOpticalTrend(
    params: WaferQueryParams,
  ): Promise<OpticalTrendResponse[]> {
    return this.fetchFromApi<OpticalTrendResponse[]>('optical-trend', {
      ...params,
    });
  }
}

// backend/src/performance/performance.service.ts
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

export interface PerformanceTrendResponse {
  eqpId: string;
  timestamp: string | Date;
  cpuUsage: number;
  memoryUsage: number;
  cpuTemp: number;
  gpuTemp: number;
  fanSpeed: number;
}

export interface ProcessMemoryResponse {
  timestamp: string | Date;
  processName: string;
  memoryUsageMB: number;
}

export interface ItmAgentTrendResponse {
  timestamp: string | Date;
  eqpId: string;
  memoryUsageMB: number;
}

export interface PerformanceQueryParams {
  startDate?: string | Date;
  endDate?: string | Date;
  eqpids?: string;
  eqpId?: string;
  intervalSeconds?: number;
  site?: string;
  sdwt?: string;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/performance';

  constructor(private readonly httpService: HttpService) {}

  private async fetchFromApi<T>(
    endpoint: string,
    params: PerformanceQueryParams,
  ): Promise<T> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = `${this.DATA_API_BASE}/${endpoint}`;
      const cleanParams: Record<string, string> = {};

      const rawEntries = Object.entries(
        params as unknown as Record<string, unknown>,
      );

      // [ESLint 수정] no-base-to-string 오류 해결을 위한 타입 체크 강화
      rawEntries.forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }

        if (typeof value === 'string') {
          cleanParams[key] = value;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          cleanParams[key] = String(value);
        } else if (value instanceof Date) {
          cleanParams[key] = value.toISOString();
        } else {
          // 객체 타입인 경우(배열 포함) JSON 문자열로 명시적 변환
          cleanParams[key] = JSON.stringify(value);
        }
      });

      const dummyConfig: InternalAxiosRequestConfig = {
        params: cleanParams,
        url: targetPath,
      } as InternalAxiosRequestConfig;
      finalUrl = axios.getUri(dummyConfig);

      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get<T>(targetPath, {
          params: cleanParams,
          headers: {
            Accept: 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Unknown Error';
      let statusCode = 500;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        statusCode = axiosError.response?.status || 500;
        const errorData = axiosError.response?.data;
        errorMessage = errorData
          ? JSON.stringify(errorData)
          : axiosError.message;

        this.logger.error(
          `[Data API Error] ${statusCode} - Failed URL: ${finalUrl}`,
        );
      }

      if (statusCode === 404) {
        return [] as unknown as T;
      }

      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }

  // --- API Methods ---

  async getHistory(
    startDate: string,
    endDate: string,
    eqpids: string,
    intervalSeconds: number = 300,
  ): Promise<PerformanceTrendResponse[]> {
    return this.fetchFromApi<PerformanceTrendResponse[]>('history', {
      startDate,
      endDate,
      eqpids,
      intervalSeconds,
    });
  }

  async getProcessHistory(
    startDate: string,
    endDate: string,
    eqpId: string,
    intervalSeconds?: number,
  ): Promise<ProcessMemoryResponse[]> {
    return this.fetchFromApi<ProcessMemoryResponse[]>('process-history', {
      startDate,
      endDate,
      eqpId,
      intervalSeconds,
    });
  }

  async getItmAgentTrend(
    site: string,
    sdwt: string,
    eqpid: string,
    startDate: string,
    endDate: string,
    intervalSeconds?: number,
  ): Promise<ItmAgentTrendResponse[]> {
    return this.fetchFromApi<ItmAgentTrendResponse[]>('itm-agent-trend', {
      site,
      sdwt,
      eqpId: eqpid,
      startDate,
      endDate,
      intervalSeconds,
    });
  }
}

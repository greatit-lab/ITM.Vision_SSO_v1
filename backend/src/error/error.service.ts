// backend/src/error/error.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';

// DTO 정의
export interface ErrorQueryParams {
  startDate: string;
  endDate: string;
  site?: string;
  sdwt?: string;
  eqpids?: string;
  page?: number | string;
  pageSize?: number | string;
}

export interface ErrorSummaryResponse {
  totalErrorCount: number;
  errorEqpCount: number;
  topErrorId: string;
  topErrorCount: number;
  topErrorLabel: string;
  errorCountByEqp: { label: string; value: number }[];
}

export interface ErrorTrendItem {
  date: string | Date;
  count: number;
}

export interface ErrorLogItem {
  timeStamp: string | Date;
  eqpId: string;
  errorId: string;
  errorLabel: string;
  errorDesc: string;
  extraMessage1: string;
  extraMessage2: string;
}

export interface ErrorLogsResponse {
  items: ErrorLogItem[];
  totalItems: number;
}

@Injectable()
export class ErrorService {
  private readonly logger = new Logger(ErrorService.name);
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/error';

  constructor(private readonly httpService: HttpService) {}

  /**
   * [Core] 공통 Fetcher
   */
  private async fetchApi<T>(endpoint: string, params: unknown): Promise<T> {
    let finalUrl = 'URL_NOT_GENERATED';
    const targetPath = `${this.DATA_API_BASE}/${endpoint}`;

    try {
      const cleanParams: Record<string, string> = {};
      
      // [ESLint 수정] 파라미터 타입 명시적 확인 후 변환
      if (typeof params === 'object' && params !== null) {
        Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
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
            // 그 외 객체나 배열 등은 JSON 문자열로 변환
            cleanParams[key] = JSON.stringify(value);
          }
        });
      }

      const queryString = new URLSearchParams(cleanParams).toString();
      finalUrl = queryString ? `${targetPath}?${queryString}` : targetPath;
      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get<T>(targetPath, { params: cleanParams }),
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
        
        this.logger.error(`[Data API Error] ${statusCode} - ${finalUrl} / Msg: ${errorMessage}`);
      } else {
        this.logger.error(`[Data API Error] Unknown - ${finalUrl}`);
      }

      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }

  async getSummary(params: ErrorQueryParams): Promise<ErrorSummaryResponse> {
    return this.fetchApi<ErrorSummaryResponse>('summary', params);
  }

  async getTrend(params: ErrorQueryParams): Promise<ErrorTrendItem[]> {
    return this.fetchApi<ErrorTrendItem[]>('trend', params);
  }

  async getLogs(params: ErrorQueryParams): Promise<ErrorLogsResponse> {
    return this.fetchApi<ErrorLogsResponse>('logs', params);
  }
}

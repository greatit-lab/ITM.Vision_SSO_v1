// backend/src/error/error.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [추가] 타입 정의 (ESLint unsafe-assignment 해결용)
export interface ErrorLog {
  errorId: string;
  errorCode: string;
  errorMessage: string;
  timestamp: Date | string;
  eqpId: string;
  severity: string;
  [key: string]: unknown;
}

export interface ErrorListResponse {
  total: number;
  items: ErrorLog[];
}

export interface ErrorSummaryResponse {
  totalCount: number;
  byLevel: Array<{ level: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
}

export interface ErrorTrendItem {
  date: string;
  count: number;
}

export class CreateErrorLogDto {
  errorCode: string;
  errorMessage: string;
  eqpId: string;
  severity?: string;
}

export class ErrorQueryParams {
  site?: string;
  sdwt?: string;
  startDate?: string;
  endDate?: string;
  eqpId?: string;
  severity?: string;
  page?: number | string;
  limit?: number | string;
  pageSize?: number | string; 
}

@Injectable()
export class ErrorService {
  private readonly DOMAIN = 'error';
  private readonly logger = new Logger(ErrorService.name);

  constructor(private readonly dataApiService: DataApiService) {}

  // 1. 에러 목록 조회
  async getErrors(params: ErrorQueryParams): Promise<ErrorListResponse> {
    const queryParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    });

    try {
      // [수정] 제네릭 타입 명시 (<ErrorListResponse>)
      const result = await this.dataApiService.request<ErrorListResponse>(
        this.DOMAIN,
        'get',
        'list', 
        undefined,
        queryParams,
      );
      return result || { total: 0, items: [] };
    } catch (e) {
      // [수정] e를 사용하여 unused-vars 해결 및 로깅
      this.logger.warn(`Failed to get error list: ${e instanceof Error ? e.message : String(e)}`);
      return { total: 0, items: [] };
    }
  }

  // 2. 에러 요약 조회 (Summary)
  async getErrorSummary(params: ErrorQueryParams): Promise<ErrorSummaryResponse> {
    const queryParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    });

    try {
      // [수정] 제네릭 타입 명시
      const result = await this.dataApiService.request<ErrorSummaryResponse>(
        this.DOMAIN,
        'get',
        'summary',
        undefined,
        queryParams,
      );
      return result || { totalCount: 0, byLevel: [], byType: [] };
    } catch (e) {
      this.logger.warn(`Failed to get error summary: ${e instanceof Error ? e.message : String(e)}`);
      return { totalCount: 0, byLevel: [], byType: [] };
    }
  }

  // 3. 에러 트렌드 조회 (Trend)
  async getErrorTrend(params: ErrorQueryParams): Promise<ErrorTrendItem[]> {
    const queryParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    });

    try {
      // [수정] 제네릭 타입 명시
      const result = await this.dataApiService.request<ErrorTrendItem[]>(
        this.DOMAIN,
        'get',
        'trend',
        undefined,
        queryParams,
      );
      return Array.isArray(result) ? result : [];
    } catch (e) {
      this.logger.warn(`Failed to get error trend: ${e instanceof Error ? e.message : String(e)}`);
      return [];
    }
  }

  // 4. 에러 상세 조회
  async getErrorDetail(errorId: string): Promise<ErrorLog | null> {
    return this.dataApiService.request<ErrorLog>(
      this.DOMAIN,
      'get',
      errorId,
      undefined,
      undefined,
      { returnNullOn404: true },
    );
  }

  // 5. 에러 로그 생성
  async createError(data: CreateErrorLogDto): Promise<ErrorLog | null> {
    return this.dataApiService.request<ErrorLog>(
      this.DOMAIN,
      'post',
      '',
      data,
    );
  }
}

// backend/src/error/error.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';
import dayjs from 'dayjs'; 

interface RawDataApiItem {
  [key: string]: any;
}

export interface ErrorLog {
  errorId: string;
  errorCode: string;
  errorMessage: string;
  timeStamp: Date | string; 
  eqpId: string;
  severity: string;
  [key: string]: unknown;
}

export interface ErrorListResponse {
  totalItems: number;
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

// [수정 포인트] '!' (Definite Assignment Assertion) 연산자를 사용하여 
// TypeScript의 strictPropertyInitialization 에러(TS2564)를 해결했습니다.
export class CreateErrorLogDto {
  errorCode!: string;
  errorMessage!: string;
  eqpId!: string;
  severity?: string;
}

export class ErrorQueryParams {
  site?: string;
  sdwt?: string;
  startDate?: string | Date;
  endDate?: string | Date;
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

  private buildQueryParams(params: ErrorQueryParams): Record<string, string> {
    const queryParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Data-API 백엔드의 파라미터 규격에 맞춰 이름 강제 매핑
        let targetKey = key;
        if (key === 'startDate') targetKey = 'start';
        if (key === 'endDate') targetKey = 'end';
        if (key === 'limit') targetKey = 'pageSize';

        if (value instanceof Date) {
          queryParams[targetKey] = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
        } else {
          queryParams[targetKey] = String(value);
        }
      }
    });
    return queryParams;
  }

  private findTimestampValue(item: RawDataApiItem): string | Date | undefined {
    if (!item) return undefined;

    if (item['timeStamp']) return item['timeStamp'] as string | Date;
    if (item['timestamp']) return item['timestamp'] as string | Date;
    if (item['time_stamp']) return item['time_stamp'] as string | Date;

    const keys = Object.keys(item);
    const targetKey = keys.find(k => k.toLowerCase().replace(/_/g, '') === 'timestamp');
    
    if (targetKey) {
        return item[targetKey] as string | Date;
    }
    return undefined;
  }

  async getErrors(params: ErrorQueryParams): Promise<ErrorListResponse> {
    const queryParams = this.buildQueryParams(params);

    try {
      const result = await this.dataApiService.request<ErrorListResponse>(
        this.DOMAIN,
        'get',
        'list',
        undefined,
        queryParams,
      );

      const rawItems = (result?.items ?? []) as unknown as RawDataApiItem[];

      if (rawItems.length > 0) {
        this.logger.debug(`[Debug] First Item Keys: ${JSON.stringify(Object.keys(rawItems[0]))}`);
        const sampleTime = this.findTimestampValue(rawItems[0]);
        this.logger.debug(`[Debug] First Item timeStamp Value: ${String(sampleTime)}`);
      } else {
        this.logger.debug(`[Debug] No items returned from Data-API`);
      }
      
      const safeItems: ErrorLog[] = rawItems.map((item) => {
        const foundTime = this.findTimestampValue(item);
        const normalizedTime = foundTime || '';

        return {
          ...item,
          timeStamp: normalizedTime, 
        } as ErrorLog;
      });

      return {
        totalItems: result?.totalItems ?? 0,
        items: safeItems
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Failed to get error list: ${msg}`);
      return { totalItems: 0, items: [] };
    }
  }

  async getErrorSummary(params: ErrorQueryParams): Promise<ErrorSummaryResponse> {
    const queryParams = this.buildQueryParams(params);

    try {
      const result = await this.dataApiService.request<ErrorSummaryResponse>(
        this.DOMAIN,
        'get',
        'summary',
        undefined,
        queryParams,
      );
      return result || { totalCount: 0, byLevel: [], byType: [] };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Failed to get error summary: ${msg}`);
      return { totalCount: 0, byLevel: [], byType: [] };
    }
  }

  async getErrorTrend(params: ErrorQueryParams): Promise<ErrorTrendItem[]> {
    const queryParams = this.buildQueryParams(params);

    try {
      const result = await this.dataApiService.request<ErrorTrendItem[]>(
        this.DOMAIN,
        'get',
        'trend',
        undefined,
        queryParams,
      );
      return Array.isArray(result) ? result : [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Failed to get error trend: ${msg}`);
      return [];
    }
  }

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

  async createError(data: CreateErrorLogDto): Promise<ErrorLog | null> {
    return this.dataApiService.request<ErrorLog>(
      this.DOMAIN,
      'post',
      '',
      data,
    );
  }
}

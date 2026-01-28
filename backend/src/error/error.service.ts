// backend/src/error/error.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';
import dayjs from 'dayjs'; 

// [수정] ESLint unsafe-* 해결을 위한 명시적 인덱스 시그니처 인터페이스
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

export class CreateErrorLogDto {
  errorCode: string;
  errorMessage: string;
  eqpId: string;
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
        if (value instanceof Date) {
          queryParams[key] = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
        } else {
          queryParams[key] = String(value);
        }
      }
    });
    return queryParams;
  }

  // [수정] item 타입을 any -> RawDataApiItem으로 변경하여 unsafe-member-access 해결
  private findTimestampValue(item: RawDataApiItem): string | Date | undefined {
    if (!item) return undefined;

    // 1. 명확한 키 우선 확인 (타입 단언으로 unsafe-return 해결)
    if (item['timeStamp']) return item['timeStamp'] as string | Date;
    if (item['timestamp']) return item['timestamp'] as string | Date;
    if (item['time_stamp']) return item['time_stamp'] as string | Date;

    // 2. 키 목록을 순회하며 'timestamp'가 포함된 키 찾기
    const keys = Object.keys(item);
    const targetKey = keys.find(k => k.toLowerCase().replace(/_/g, '') === 'timestamp');
    
    if (targetKey) {
        return item[targetKey] as string | Date;
    }
    return undefined;
  }

  // 1. 에러 목록 조회
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

      // [수정] any 배열 대신 인터페이스 배열로 변환
      const rawItems = (result?.items ?? []) as unknown as RawDataApiItem[];

      // [디버깅 로그] String() 변환으로 restrict-template-expressions 해결
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

        // [수정] ErrorLog 타입으로 명확히 반환
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
      // e가 Error 객체인지 확인하여 안전하게 접근
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Failed to get error list: ${msg}`);
      return { totalItems: 0, items: [] };
    }
  }

  // 2. 에러 요약 조회
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

  // 3. 에러 트렌드 조회
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

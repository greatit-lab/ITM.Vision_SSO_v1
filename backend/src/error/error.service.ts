// backend/src/error/error.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [유지] DTO/Interface 정의
export interface ErrorLog {
  errorId: string;
  errorCode: string;
  errorMessage: string;
  timestamp: Date | string;
  eqpId: string;
  severity: string;
  [key: string]: any;
}

export class CreateErrorLogDto {
  errorCode: string;
  errorMessage: string;
  eqpId: string;
  severity?: string;
}

// [수정] Interface -> Class로 변경 (TS1272 에러 해결)
// NestJS 컨트롤러에서 @Query() 타입으로 사용되려면 클래스여야 합니다.
export class ErrorQueryParams {
  startDate?: string;
  endDate?: string;
  eqpId?: string;
  severity?: string;
  page?: number | string;
  limit?: number | string;
}

// [추가] 통계 결과 타입 정의 (Unsafe return 해결용)
// 구체적인 필드를 모를 경우 Record<string, any>를 사용하여 any보다는 안전하게 처리
export type ErrorStatisticsResult = Record<string, any>;

@Injectable()
export class ErrorService {
  private readonly DOMAIN = 'error';

  constructor(private readonly dataApiService: DataApiService) {}

  async getErrors(params: ErrorQueryParams): Promise<ErrorLog[]> {
    const queryParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    });

    const result = await this.dataApiService.request<ErrorLog[]>(
      this.DOMAIN,
      'get',
      '', // GET /api/error
      undefined,
      queryParams,
    );
    return result || [];
  }

  async getErrorDetail(errorId: string): Promise<ErrorLog | null> {
    return this.dataApiService.request<ErrorLog>(
      this.DOMAIN,
      'get',
      errorId, // GET /api/error/:id
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

  // [수정] 반환 타입을 명시하여 ESLint 에러 해결
  async getErrorStatistics(params: ErrorQueryParams): Promise<ErrorStatisticsResult | null> {
    const queryParams: Record<string, string> = {};
     Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    });

    return this.dataApiService.request<ErrorStatisticsResult>(
      this.DOMAIN,
      'get',
      'statistics', // GET /api/error/statistics
      undefined,
      queryParams,
    );
  }
}

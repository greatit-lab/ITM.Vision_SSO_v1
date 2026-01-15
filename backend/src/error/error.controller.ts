// backend/src/error/error.controller.ts
import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { 
  ErrorService, 
  CreateErrorLogDto, 
  ErrorQueryParams, 
  ErrorListResponse, 
  ErrorSummaryResponse, 
  ErrorTrendItem, 
  ErrorLog 
} from './error.service';

@Controller('error')
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  // 1. 에러 로그 목록 조회
  // [수정] 반환 타입 Promise<ErrorListResponse> 명시 (unsafe-return 해결)
  @Get('logs')
  async getLogs(@Query() query: ErrorQueryParams): Promise<ErrorListResponse> {
    return this.errorService.getErrors(query);
  }

  // 2. 에러 요약 조회 (Summary)
  // [수정] 반환 타입 명시
  @Get('summary')
  async getSummary(@Query() query: ErrorQueryParams): Promise<ErrorSummaryResponse> {
    return this.errorService.getErrorSummary(query);
  }

  // 3. 에러 트렌드 조회 (Trend)
  // [수정] 반환 타입 명시
  @Get('trend')
  async getTrend(@Query() query: ErrorQueryParams): Promise<ErrorTrendItem[]> {
    return this.errorService.getErrorTrend(query);
  }

  // 4. 에러 상세 조회
  @Get(':id')
  async getErrorDetail(@Param('id') id: string): Promise<ErrorLog | null> {
    return this.errorService.getErrorDetail(id);
  }

  // 5. 에러 로그 생성
  @Post()
  async createError(@Body() data: CreateErrorLogDto): Promise<ErrorLog | null> {
    return this.errorService.createError(data);
  }
}

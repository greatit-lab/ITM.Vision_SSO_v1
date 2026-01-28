// backend/src/error/error.controller.ts
import { Controller, Get, Query, Param, Post, Body, UseInterceptors, UsePipes } from '@nestjs/common';
import { 
  ErrorService, 
  CreateErrorLogDto, 
  ErrorQueryParams, 
  ErrorListResponse, 
  ErrorSummaryResponse, 
  ErrorTrendItem, 
  ErrorLog 
} from './error.service';
import { DateTransformInterceptor } from '../common/interceptors/date-transform.interceptor';
import { DateInputPipe } from '../common/pipes/date-input.pipe';

@Controller('error') // URL Prefix: /api/error
@UseInterceptors(DateTransformInterceptor)
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  // 1. 에러 로그 목록 조회
  // [핵심 수정] '@Get('logs')' -> '@Get('list')'로 변경하여 경로 통일
  @Get('list') 
  @UsePipes(new DateInputPipe())
  async getLogs(@Query() query: ErrorQueryParams): Promise<ErrorListResponse> {
    return this.errorService.getErrors(query);
  }

  // 2. 에러 요약 조회
  @Get('summary')
  @UsePipes(new DateInputPipe())
  async getSummary(@Query() query: ErrorQueryParams): Promise<ErrorSummaryResponse> {
    return this.errorService.getErrorSummary(query);
  }

  // 3. 에러 트렌드 조회
  @Get('trend')
  @UsePipes(new DateInputPipe())
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

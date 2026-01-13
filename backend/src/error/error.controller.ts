// backend/src/error/error.controller.ts
import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { ErrorService, CreateErrorLogDto, ErrorQueryParams } from './error.service';

@Controller('error')
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  // 1. 에러 로그 목록 조회
  @Get('logs')
  async getLogs(@Query() query: ErrorQueryParams) {
    return this.errorService.getErrors(query);
  }

  // 2. 에러 통계/요약
  @Get('statistics')
  async getStatistics(@Query() query: ErrorQueryParams) {
    return this.errorService.getErrorStatistics(query);
  }

  // 3. 에러 상세 조회
  @Get(':id')
  async getErrorDetail(@Param('id') id: string) {
    return this.errorService.getErrorDetail(id);
  }

  // 4. 에러 로그 생성
  @Post()
  async createError(@Body() data: CreateErrorLogDto) {
    return this.errorService.createError(data);
  }
}

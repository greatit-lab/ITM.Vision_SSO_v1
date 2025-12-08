// backend/src/performance/performance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('api/PerformanceAnalytics')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ▼▼▼ [복구] 누락되었던 history 엔드포인트 추가 ▼▼▼
  @Get('history')
  getHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpids') eqpids: string,
    @Query('intervalSeconds') intervalSeconds?: string,
  ) {
    // intervalSeconds가 쿼리 스트링(string)으로 넘어오므로 숫자로 변환
    const interval = intervalSeconds ? parseInt(intervalSeconds, 10) : 300;

    return this.performanceService.getHistory(
      startDate,
      endDate,
      eqpids,
      interval,
    );
  }

  @Get('process-history')
  getProcessHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpid') eqpId: string,
    @Query('intervalSeconds') intervalSeconds?: string,
  ) {
    return this.performanceService.getProcessHistory(
      startDate,
      endDate,
      eqpId,
      intervalSeconds ? Number(intervalSeconds) : undefined,
    );
  }
}

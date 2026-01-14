// backend/src/performance/performance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

// [수정] 대소문자 일치: 'Performance' -> 'performance'
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('history')
  getHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpids') eqpids: string,
    @Query('interval') interval: string,
  ) {
    const intervalNum = interval ? parseInt(interval, 10) : 300;
    return this.performanceService.getHistory(
      startDate,
      endDate,
      eqpids,
      intervalNum,
    );
  }

  @Get('process-history')
  getProcessHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpId') eqpId: string,
    @Query('interval') interval: string,
  ) {
    const intervalNum = interval ? parseInt(interval, 10) : 0;
    return this.performanceService.getProcessHistory(
      startDate,
      endDate,
      eqpId,
      intervalNum,
    );
  }

  @Get('itm-agent-trend')
  getItmAgentTrend(
    @Query('site') site: string,
    @Query('sdwt') sdwt: string,
    @Query('eqpid') eqpid: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval: string,
  ) {
    const intervalNum = interval ? parseInt(interval, 10) : 0;
    return this.performanceService.getItmAgentTrend(
      site,
      sdwt,
      eqpid,
      startDate,
      endDate,
      intervalNum,
    );
  }
}

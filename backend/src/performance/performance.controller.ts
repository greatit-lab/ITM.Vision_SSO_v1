// backend/src/performance/performance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

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
    // [핵심] 프론트에서 넘긴 interval 값을 받아서 변환. 없으면 기본 20분(1200초)
    const intervalNum = interval ? parseInt(interval, 10) : 1200;
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
    const intervalNum = interval ? parseInt(interval, 10) : 60;
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
    const intervalNum = interval ? parseInt(interval, 10) : 60;
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

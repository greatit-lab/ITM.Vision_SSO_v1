// backend/src/health/health.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('Health') 
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // [수정] baseDate 파라미터 제거
  @Get('summary')
  getSummary(@Query('site') site: string, @Query('sdwt') sdwt?: string) {
    return this.healthService.getHealthSummary(site, sdwt);
  }
}

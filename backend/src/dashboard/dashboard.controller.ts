import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Query('site') site: string, @Query('sdwt') sdwt: string) {
    return await this.dashboardService.getSummary(site, sdwt);
  }

  @Get('agentstatus')
  async getAgentStatus(@Query('site') site: string, @Query('sdwt') sdwt: string) {
    return await this.dashboardService.getAgentStatus(site, sdwt);
  }
}

// backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Global Prefix('api')와 결합되어 최종 URL은 '/api/dashboard'가 됩니다.
@Controller('dashboard')
@UseGuards(JwtAuthGuard) // JWT 인증 및 데모 모드 지원 Guard
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // [신규 추가] 프론트엔드의 404 에러를 해결할 신규 라우트
  @Get('global-fleet')
  async getGlobalFleetData() {
    return this.dashboardService.getGlobalFleetData();
  }

  @Get('summary')
  async getSummary(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
  ) {
    return this.dashboardService.getSummary(site, sdwt);
  }

  @Get('agentstatus')
  async getAgentStatus(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
  ) {
    return this.dashboardService.getAgentStatus(site, sdwt);
  }
}

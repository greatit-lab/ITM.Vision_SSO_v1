// [전체 코드 교체]
// 프로젝트: ITM.Vision_SSO_v1
// 파일 경로: backend/src/dashboard/dashboard.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Global Prefix('api')와 결합되어 최종 URL은 '/api/dashboard'가 됩니다.
@Controller('dashboard')
@UseGuards(JwtAuthGuard) // JWT 인증 및 데모 모드 지원 Guard
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

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

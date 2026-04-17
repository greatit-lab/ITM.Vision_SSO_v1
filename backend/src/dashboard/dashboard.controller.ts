// backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService, EasterEggResponse, EasterEggRank } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface JwtPayload {
  userId?: string;
  username?: string;
  [key: string]: unknown;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

interface EasterEggDto {
  eggType: string;
  score?: number;
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('global-fleet')
  async getGlobalFleetData(): Promise<unknown[]> {
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

  // [수정됨] Data API에서 null이 반환될 수 있으므로 '| null' 추가
  @Post('easter-egg')
  async saveEasterEgg(
    @Req() req: RequestWithUser,
    @Body() body: EasterEggDto
  ): Promise<EasterEggResponse | null> { 
    const user = req.user;
    let userId = 'Unknown_Agent';

    if (user) {
        if (typeof user.username === 'string' && user.username.trim() !== '') {
            userId = user.username;
        } else if (typeof user.userId === 'string' && user.userId.trim() !== '') {
            userId = user.userId;
        }
    }

    return this.dashboardService.saveEasterEgg(userId, body.eggType, body.score);
  }

  // [수정됨] 사용하지 않던 'EasterEggRank' 임포트를 반환 타입으로 명시하여 ESLint 에러 해결
  @Get('easter-egg/ranking')
  async getEasterEggRanking(@Query('eggType') eggType: string): Promise<EasterEggRank[]> {
    return this.dashboardService.getEasterEggRanking(eggType);
  }
}

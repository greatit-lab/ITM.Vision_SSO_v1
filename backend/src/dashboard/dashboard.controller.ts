// backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express'; // Express Request 임포트
import { DashboardService, EasterEggResponse, EasterEggRank } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// JWT Guard를 통과한 후 req.user에 담기는 Payload 타입 정의
interface JwtPayload {
  userId?: string;
  username?: string;
  [key: string]: unknown; // 기타 속성들 허용
}

// Request 타입을 확장하여 user 속성 명시
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
  async getGlobalFleetData(): Promise<unknown[]> { // any 대신 unknown 사용 권장, 서비스에서 구체적 타입이면 변경
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

  // [수정됨] any 제거 및 타입 안정성 확보
  @Post('easter-egg')
  async saveEasterEgg(
    @Req() req: RequestWithUser, // 명시적 타입 지정
    @Body() body: EasterEggDto
  ): Promise<EasterEggResponse> { // 반환 타입 명시
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

  @Get('easter-egg/ranking')
  async getEasterEggRanking(@Query('eggType') eggType: string) {
    return this.dashboardService.getEasterEggRanking(eggType);
  }
}

// backend/src/alert/alert.controller.ts
import { Controller, Get, Post, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AlertService } from './alert.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

// Request 객체 타입 정의 (User 정보 포함)
interface RequestWithUser extends Request {
  user?: {
    userId: string;
    [key: string]: any;
  };
}

@Controller('alert')
@UseGuards(JwtAuthGuard) // [중요] Frontend의 요청은 인증 필요
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  // 1. 내 알림 조회
  @Get()
  async getMyAlerts(@Req() req: RequestWithUser) {
    const userId = req.user?.userId || '';
    return this.alertService.getMyAlerts(userId);
  }

  // 2. 안 읽은 개수 조회
  @Get('unread-count')
  async getUnreadCount(@Req() req: RequestWithUser) {
    const userId = req.user?.userId || '';
    return this.alertService.getUnreadCount(userId);
  }

  // 3. 읽음 처리
  @Post(':id/read')
  async readAlert(@Param('id', ParseIntPipe) id: number) {
    return this.alertService.readAlert(id);
  }
}

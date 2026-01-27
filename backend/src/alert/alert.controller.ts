// backend/src/alert/alert.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AlertService } from './alert.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

// [Type Definition] Request 객체 확장 (User 정보 포함)
interface RequestWithUser extends Request {
  user?: {
    userId: string;
    [key: string]: any;
  };
}

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAlerts(@Req() req: RequestWithUser) {
    // 이제 req.user가 타입핑되어 있으므로 unsafe access 오류가 사라집니다.
    const userId = req.user?.userId;
    
    // Authorization 헤더에서 토큰 추출
    const token = req.headers.authorization;
    
    // userId는 string | undefined 타입이므로 서비스 메서드와 호환됩니다.
    return await this.alertService.getAlerts(userId, token);
  }
}

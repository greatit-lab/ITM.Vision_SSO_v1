// backend/src/auth/auth.controller.ts
import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
// [수정] Request, Response는 인터페이스이므로 'import type' 사용
import type { Response, Request } from 'express';
import { User } from './auth.interface';

// RequestWithUser 인터페이스 정의
interface RequestWithUser extends Request {
  user: User;
}

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('saml'))
  async login() {
    // Passport 처리
  }

  @Post('callback')
  @UseGuards(AuthGuard('saml'))
  async callback(@Req() req: RequestWithUser, @Res() res: Response) {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=NoUser`);
    }

    const jwtResult = await this.authService.login(req.user);

    const redirectUrl = `${process.env.FRONTEND_URL}?token=${jwtResult.access_token}&user=${encodeURIComponent(JSON.stringify(req.user))}`;
    
    res.redirect(redirectUrl);
  }
}

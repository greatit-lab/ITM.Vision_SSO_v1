// backend/src/auth/auth.controller.ts
import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SamlStrategy } from './saml.strategy';
import type { Response, Request } from 'express';
import { User } from './auth.interface';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private samlStrategy: SamlStrategy,
  ) {}

  // 1. SSO 로그인 시작
  @Get('login')
  @UseGuards(AuthGuard('saml'))
  async login() {
    // Passport가 자동으로 처리
  }

  // 2. SSO 콜백
  @Post('callback')
  @UseGuards(AuthGuard('saml'))
  async callback(@Req() req: RequestWithUser, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8082/login';

    if (!req.user) {
      return res.redirect(`${frontendUrl}?error=NoUser`);
    }

    const jwtResult = await this.authService.login(req.user);

    const userJson = JSON.stringify(req.user);
    const encodedUser = encodeURIComponent(userJson);

    const redirectUrl = `${frontendUrl}?token=${jwtResult.access_token}&user=${encodedUser}`;
    
    return res.redirect(redirectUrl);
  }

  // 3. 메타데이터 제공 (수정: async 제거)
  @Get('metadata')
  getMetadata(@Res() res: Response) {
    try {
      const metadata = this.samlStrategy.getServiceProviderMetadata();
      res.set('Content-Type', 'application/xml');
      res.send(metadata);
    } catch (e) {
      console.error('Metadata generation failed', e);
      res.status(500).send('Failed to generate metadata');
    }
  }
}

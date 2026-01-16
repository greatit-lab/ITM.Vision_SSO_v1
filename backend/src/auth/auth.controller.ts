// backend/src/auth/auth.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SamlStrategy } from './saml.strategy';
import type { Response, Request } from 'express';
import type { User } from './auth.interface';

interface RequestWithUser extends Request {
  user: User;
}

interface ErrorWithStatus {
  message?: string;
  status?: number;
  constructor?: { name: string };
}

export class GuestRequestDto {
  loginId: string;
  deptName?: string;
  deptCode?: string;
  reason?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private samlStrategy: SamlStrategy,
  ) {}

  @Get('login')
  @UseGuards(AuthGuard('saml'))
  async samlLogin() {
    // Redirect handled by Passport
  }

  @Post('callback')
  @UseGuards(AuthGuard('saml'))
  async callback(@Req() req: RequestWithUser, @Res() res: Response) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://localhost:8082/login';

    if (!req.user) {
      return res.redirect(`${frontendUrl}?error=NoUser`);
    }

    try {
      const jwtResult = await this.authService.login(req.user);

      const userJson = JSON.stringify(jwtResult.user);
      const encodedUser = encodeURIComponent(userJson);
      return res.redirect(
        `${frontendUrl}?token=${jwtResult.access_token}&user=${encodedUser}`,
      );
    } catch (error: unknown) {
      const err = error as ErrorWithStatus;

      const message = err.message || 'Unknown Error';
      const status = err.status || 500;
      const typeName = err.constructor?.name || 'Error';

      console.log(
        `[SSO Callback Error] Type: ${typeName}, Message: ${message}, Status: ${status}`,
      );

      if (
        error instanceof ForbiddenException ||
        status === 403 ||
        message === 'AccessDenied'
      ) {
        let errorType = 'AccessDenied';

        if (message === 'PendingApproval') {
          errorType = 'PendingApproval';
        } else if (message === 'Rejected') {
          errorType = 'Rejected';
        }

        const params = new URLSearchParams({
          error: errorType,
          loginId: req.user.userId || '',
          deptCode: req.user.department || '',
          deptName: req.user.departmentName || '',
        });

        return res.redirect(`${frontendUrl}?${params.toString()}`);
      }

      console.error('[SSO Callback] Critical Error:', error);
      return res.redirect(`${frontendUrl}?error=ServerErrors`);
    }
  }

  @Get('metadata')
  getMetadata(@Res() res: Response) {
    try {
      const metadata = this.samlStrategy.getServiceProviderMetadata();
      res.set('Content-Type', 'application/xml');
      res.send(metadata);
    } catch (e) {
      console.error('Metadata generation failed:', e);
      res.status(500).send('Failed to generate metadata');
    }
  }

  @Post('guest-request')
  async requestGuestAccess(@Body() body: GuestRequestDto) {
    console.log('[SSO Controller] Guest Request Body:', body);
    return this.authService.createGuestRequest(body);
  }

  // =========================================================
  // [수정 및 추가] Context 관련 핸들러
  // =========================================================

  /**
   * [추가] 사용자 Context (Site/SDWT) 조회
   * 프론트엔드의 GET /api/auth/context 요청을 처리
   */
  @Get('context')
  async getUserContext(@Query('loginId') loginId: string) {
    // loginId가 쿼리 파라미터로 전달됨
    return await this.authService.getUserContext(loginId);
  }

  /**
   * [기존 유지] 사용자 Context 저장
   */
  @Post('context')
  @UseGuards(AuthGuard('jwt'))
  async saveContext(
    @Req() req: RequestWithUser,
    @Body() body: { site: string; sdwt: string },
  ) {
    return await this.authService.saveUserContext(
      req.user.userId, // JWT에서 추출한 안전한 ID 사용
      body.site,
      body.sdwt,
    );
  }

  @Get('access-codes')
  async getAccessCodes() {
    return await this.authService.getAccessCodes();
  }
}

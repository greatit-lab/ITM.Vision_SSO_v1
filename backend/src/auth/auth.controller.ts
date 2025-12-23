// backend/src/auth/auth.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
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

// 에러 처리를 위한 헬퍼 인터페이스
interface ErrorWithStatus {
  message?: string;
  status?: number;
  constructor?: { name: string };
}

export class GuestRequestDto {
  loginId: string;
  deptName: string;
  deptCode?: string;
  reason: string;
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

        // [수정] deptCode(부서코드) 추가 전달
        const params = new URLSearchParams({
          error: errorType,
          loginId: req.user.userId || '',
          deptCode: req.user.department || '', // AD DeptID -> deptCode
          deptName: req.user.departmentName || '', // AD DeptName -> deptName
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
    return this.authService.createGuestRequest(body);
  }

  @Post('context')
  @UseGuards(AuthGuard('jwt'))
  async saveContext(
    @Req() req: RequestWithUser,
    @Body() body: { site: string; sdwt: string },
  ) {
    return await this.authService.saveUserContext(
      req.user.userId,
      body.site,
      body.sdwt,
    );
  }

  @Get('access-codes')
  async getAccessCodes() {
    return await this.authService.getAccessCodes();
  }
}

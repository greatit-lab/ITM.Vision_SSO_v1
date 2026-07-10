// backend/src/auth/auth.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { DataApiService } from '../common/data-api.service';
import { KnoxMailService } from '../knox/knox-mail.service';
import { MailRecipientService } from '../mail-recipient/mail-recipient.service';
import type { User, LoginResult } from './auth.interface';
import { GuestRequestDto } from './auth.controller';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly DOMAIN = 'auth';
  private readonly templatesDir = path.join(
    __dirname,
    '..',
    'knox',
    'email-templates',
  );

  constructor(
    private jwtService: JwtService,
    private readonly api: DataApiService,
    private readonly knoxMailService: KnoxMailService,
    private readonly mailRecipientService: MailRecipientService,
    private readonly configService: ConfigService,
  ) {}

  // ==========================
  // [Core] Login Logic
  // ==========================
  async login(user: User): Promise<LoginResult> {
    const rawUserId = user.userId;
    this.logger.log(
      `[LOGIN START] Processing login for Raw UserID: '${rawUserId}'`,
    );

    let isWhitelisted = false;

    // 1. Whitelist Check (보안 결함 수정: 부서 코드로만 정확히 검사)
    try {
      if (user.department) {
        // 회사 코드로 먼저 통과시키는 로직(user.companyCode 단독 검사)을 완전 삭제했습니다.
        // 오직 사번(username), 회사코드, 부서코드 3가지를 한 번에 보내 엄격하게 검증합니다.
        const authCheck = await this.api.request<{ isActive: string }>(
          this.DOMAIN,
          'get',
          'whitelist/check',
          undefined,
          {
            username: rawUserId,
            compId: user.companyCode,
            deptId: user.department,
          },
          { returnNullOn404: true },
        );

        if (authCheck?.isActive === 'Y') {
          isWhitelisted = true;
        }
      }
    } catch (e) {
      this.logger.error(`[Whitelist Check Error] ${e}`);
    }

    // 2. User Sync
    let dbLoginId = rawUserId;
    try {
      const syncedUser = await this.api.request<{ loginId: string }>(
        this.DOMAIN,
        'post',
        'user/sync',
        { loginId: rawUserId },
      );
      if (syncedUser) {
        dbLoginId = syncedUser.loginId;
      }
    } catch (e) {
      this.logger.warn(`[User Sync] Error: ${e}. Using rawUserId.`);
    }

    // 3. Role & Guest Check
    let role = 'USER';
    let hasGuestAccess = false;
    let guestValidUntil: string | undefined;

    try {
      const adminUser = await this.api.request<{ role: string }>(
        this.DOMAIN,
        'get',
        'admin/check',
        undefined,
        { loginId: dbLoginId },
        { returnNullOn404: true },
      );

      if (adminUser) {
        role = adminUser.role.toUpperCase();
      } else {
        const guestUser = await this.api.request<{
          grantedRole: string;
          validUntil?: string;
        }>(
          this.DOMAIN,
          'get',
          'guest/check',
          undefined,
          { loginId: dbLoginId },
          { returnNullOn404: true },
        );

        if (guestUser) {
          this.logger.log(
            `[Debug] Guest User Found: ${JSON.stringify(guestUser)}`,
          );
          role = guestUser.grantedRole.toUpperCase();
          hasGuestAccess = true;
          guestValidUntil = guestUser.validUntil;
        }
      }
    } catch (e) {
      this.logger.error(`[Role Check Error] ${e}`);
    }

    // 4. Final Access Decision
    const isAdmin = role === 'ADMIN' || role === 'MANAGER';
    const isAllowed = isWhitelisted || isAdmin || hasGuestAccess;

    if (!isAllowed) {
      try {
        const lastRequest = await this.api.request<{ status: string }>(
          this.DOMAIN,
          'get',
          'guest-request/status',
          undefined,
          { loginId: dbLoginId },
          { returnNullOn404: true },
        );

        if (lastRequest) {
          if (lastRequest.status === 'PENDING') {
            throw new ForbiddenException('PendingApproval');
          }
          if (lastRequest.status === 'REJECTED') {
            throw new ForbiddenException('Rejected');
          }
        }
      } catch (e) {
        if (e instanceof ForbiddenException) throw e;
        this.logger.error(`[Request Check Error] ${e}`);
      }
      throw new ForbiddenException('AccessDenied');
    }

    // 5. Token Issuance (Context Load)
    let contextSite = '';
    let contextSdwt = '';
    try {
      const userContext = await this.api.request<{
        site: string;
        sdwt: string;
      }>(
        this.DOMAIN,
        'get',
        'context',
        undefined,
        { loginId: dbLoginId },
        { returnNullOn404: true },
      );

      if (userContext) {
        contextSite = userContext.site;
        contextSdwt = userContext.sdwt;
      }
    } catch (e) {
      this.logger.warn(`[Context Load Error] ${e}`);
    }

    // 6. Final User Construction
    const finalUser: User = {
      ...user,
      userId: dbLoginId,
      role,
      site: contextSite || undefined,
      sdwt: contextSdwt || undefined,
      validUntil: guestValidUntil,
    };

    this.logger.log(`[Debug] Final User Object: ${JSON.stringify(finalUser)}`);

    const payload = {
      username: finalUser.userId,
      sub: finalUser.userId,
      role: finalUser.role,
      groups: finalUser.groups,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: finalUser,
    };
  }

  // ==========================
  // [Other Methods]
  // ==========================

  async getUserContext(loginId: string) {
    try {
      return await this.api.request(this.DOMAIN, 'get', 'context', undefined, {
        loginId,
      });
    } catch (e) {
      this.logger.error(`[getUserContext] Failed: ${e}`);
      return null;
    }
  }

  async saveUserContext(loginId: string, site: string, sdwt: string) {
    try {
      return await this.api.request(this.DOMAIN, 'post', 'context', {
        loginId,
        site,
        sdwt,
      });
    } catch (e) {
      this.logger.error(`[saveUserContext] Failed: ${e}`);
      throw new NotFoundException(`Failed to save context: ${e}`);
    }
  }

  async getAccessCodes() {
    return await this.api.request(this.DOMAIN, 'get', 'access-codes');
  }

  async createGuestRequest(data: GuestRequestDto) {
    this.logger.log(`[GUEST REQUEST] New request from ${data.loginId}`);
    const request = await this.api.request(
      this.DOMAIN,
      'post',
      'guest-request',
      data,
    );

    if (request) {
      this.sendGuestRequestNotificationMail(data).catch((error: unknown) => {
        this.logger.error(
          `[Guest Request Mail] Failed to send notification mail: ${this.getErrorMessage(
            error,
          )}`,
        );
      });
    }

    return request;
  }

  // ==========================================
  // [메일 발송] 게스트 권한 신청 알림
  // - Admin / Manager 권한자 대상
  // ==========================================
  private async sendGuestRequestNotificationMail(
    data: GuestRequestDto,
  ): Promise<void> {
    const recipients =
      await this.mailRecipientService.getBoardAdminManagerRecipientEmails();

    if (!recipients || recipients.length === 0) {
      this.logger.warn(
        `[Guest Request Mail] Skip notification. No Admin/Manager recipients. loginId=${data.loginId}`,
      );
      return;
    }

    const html = this.renderTemplate('guest-request-notification.html', {
      loginId: data.loginId,
      deptName: data.deptName || '미확인',
      reason: data.reason || '작성되지 않음',
      link: `${this.buildFrontendUrl()}/admin/users?tab=Requests`,
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: `[I:Vision] 게스트 접근 권한 신청이 접수되었습니다 (${data.loginId})`,
      content: html,
    });

    this.logger.log(
      `[Guest Request Mail] Notification sent. loginId=${data.loginId}, recipients=${recipients.length}`,
    );
  }

  // ==========================================
  // [공통] 프론트엔드 링크 생성
  // ==========================================
  private buildFrontendUrl(): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://localhost:8080';

    try {
      return new URL(frontendUrl).origin;
    } catch {
      return frontendUrl;
    }
  }

  // ==========================================
  // [공통] 이메일 템플릿 렌더링
  // ==========================================
  private renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    try {
      const templatePath = path.join(this.templatesDir, templateName);
      let html = fs.readFileSync(templatePath, 'utf-8');

      for (const [key, value] of Object.entries(variables)) {
        html = html.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      return html;
    } catch (error: unknown) {
      this.logger.error(
        `[Guest Request Mail] Failed to render template ${templateName}: ${this.getErrorMessage(
          error,
        )}`,
      );

      return '<p>새로운 알림이 있습니다. I:Vision에서 확인해 주세요.</p>';
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown error';
  }
}

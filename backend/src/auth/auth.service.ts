// backend/src/auth/auth.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataApiService } from '../common/data-api.service';
import type { User, LoginResult } from './auth.interface';
import { GuestRequestDto } from './auth.controller';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly DOMAIN = 'auth';

  constructor(
    private jwtService: JwtService,
    private readonly api: DataApiService,
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

    // 1. Whitelist Check
    try {
      if (user.companyCode) {
        const companyAuth = await this.api.request<{ isActive: string }>(
          this.DOMAIN,
          'get',
          'whitelist/check',
          undefined,
          { compId: user.companyCode },
          { returnNullOn404: true },
        );
        if (companyAuth?.isActive === 'Y') isWhitelisted = true;
      }

      if (user.department && !isWhitelisted) {
        const deptAuth = await this.api.request<{ isActive: string }>(
          this.DOMAIN,
          'get',
          'whitelist/check',
          undefined,
          { deptId: user.department },
          { returnNullOn404: true },
        );
        if (deptAuth?.isActive === 'Y') isWhitelisted = true;
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
        const guestUser = await this.api.request<{ grantedRole: string }>(
          this.DOMAIN,
          'get',
          'guest/check',
          undefined,
          { loginId: dbLoginId },
          { returnNullOn404: true },
        );
        if (guestUser) {
          role = guestUser.grantedRole.toUpperCase();
          hasGuestAccess = true;
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
      // [수정] user/context -> context (Data API 경로 일치)
      const userContext = await this.api.request<{
        site: string; // Data API 응답 구조에 맞춰 수정
        sdwt: string;
      }>(
        this.DOMAIN,
        'get',
        'context', // user/context 아님
        undefined,
        { loginId: dbLoginId },
        { returnNullOn404: true },
      );

      // Data API가 { site, sdwt } 형태로 바로 반환하는지, { sdwtInfo: { site, sdwt } }인지 확인 필요
      // 현재 Data API 코드는 { site, sdwt }를 바로 반환함
      if (userContext) {
        contextSite = userContext.site;
        contextSdwt = userContext.sdwt;
      }
    } catch (e) {
      this.logger.warn(`[Context Load Error] ${e}`);
    }

    const finalUser: User = {
      ...user,
      userId: dbLoginId,
      role,
      site: contextSite || undefined,
      sdwt: contextSdwt || undefined,
    };

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

  // [추가] Context 조회 메서드
  async getUserContext(loginId: string) {
    try {
      // Data API: GET /api/auth/context?loginId=...
      return await this.api.request(this.DOMAIN, 'get', 'context', undefined, {
        loginId,
      });
    } catch (e) {
      this.logger.error(`[getUserContext] Failed: ${e}`);
      return null;
    }
  }

  // [수정] Context 저장 메서드
  async saveUserContext(loginId: string, site: string, sdwt: string) {
    try {
      // [수정] user/context -> context (Data API 경로 일치)
      // Data API: POST /api/auth/context
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
    return await this.api.request(
      this.DOMAIN,
      'post',
      'guest-request',
      data,
    );
  }
}

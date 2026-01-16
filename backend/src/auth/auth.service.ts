// backend/src/auth/auth.service.ts
import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
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

  async login(user: User): Promise<LoginResult> {
    const rawUserId = user.userId;
    this.logger.log(`[LOGIN START] Processing login for: '${rawUserId}'`);

    let isWhitelisted = false;
    // 1. Whitelist Check
    try {
      if (user.companyCode) {
        const res = await this.api.request<{ isActive: string }>(
          this.DOMAIN, 'get', 'whitelist/check', undefined, { compId: user.companyCode }, { returnNullOn404: true }
        );
        if (res?.isActive === 'Y') isWhitelisted = true;
      }
      if (user.department && !isWhitelisted) {
        const res = await this.api.request<{ isActive: string }>(
          this.DOMAIN, 'get', 'whitelist/check', undefined, { deptId: user.department }, { returnNullOn404: true }
        );
        if (res?.isActive === 'Y') isWhitelisted = true;
      }
    } catch (e) { this.logger.error(`[Whitelist Check Error] ${e}`); }

    // 2. Sync
    let dbLoginId = rawUserId;
    try {
      const synced = await this.api.request<{ loginId: string }>(
        this.DOMAIN, 'post', 'user/sync', { loginId: rawUserId }
      );
      if (synced) dbLoginId = synced.loginId;
    } catch (e) { this.logger.warn(`[Sync Error] ${e}`); }

    // 3. Role & Guest Check
    let role = 'USER';
    let hasGuestAccess = false;
    let guestValidUntil: string | undefined;

    try {
      const admin = await this.api.request<{ role: string }>(
        this.DOMAIN, 'get', 'admin/check', undefined, { loginId: dbLoginId }, { returnNullOn404: true }
      );

      if (admin) {
        role = admin.role.toUpperCase();
      } else {
        // [디버깅] 게스트 정보 요청
        const guest = await this.api.request<{ grantedRole: string; validUntil?: string }>(
          this.DOMAIN, 'get', 'guest/check', undefined, { loginId: dbLoginId }, { returnNullOn404: true }
        );

        // >>> 디버깅 로그: Data API로부터 받은 데이터 확인
        if (guest) {
          this.logger.log(`[BFF Debug] Guest Response from Data API: ${JSON.stringify(guest)}`);
          role = guest.grantedRole.toUpperCase();
          hasGuestAccess = true;
          guestValidUntil = guest.validUntil; // 여기서 값이 들어가는지 로그로 확인
        }
      }
    } catch (e) { this.logger.error(`[Role Check Error] ${e}`); }

    // 4. Permission Check
    const isAllowed = isWhitelisted || role === 'ADMIN' || role === 'MANAGER' || hasGuestAccess;
    if (!isAllowed) {
       // ... (Request Status Check 생략)
       throw new ForbiddenException('AccessDenied');
    }

    // 5. Context
    let contextSite = '';
    let contextSdwt = '';
    try {
      const ctx = await this.api.request<{ site: string; sdwt: string }>(
        this.DOMAIN, 'get', 'context', undefined, { loginId: dbLoginId }, { returnNullOn404: true }
      );
      if (ctx) { contextSite = ctx.site; contextSdwt = ctx.sdwt; }
    } catch (e) {}

    // 6. Final User
    const finalUser: User = {
      ...user,
      userId: dbLoginId,
      role,
      site: contextSite || undefined,
      sdwt: contextSdwt || undefined,
      validUntil: guestValidUntil, // 최종 확인
    };

    // >>> 디버깅 로그: 최종 생성된 사용자 객체
    this.logger.log(`[BFF Debug] Final User Object: ${JSON.stringify(finalUser)}`);

    const payload = { username: finalUser.userId, sub: finalUser.userId, role: finalUser.role, groups: finalUser.groups };
    const accessToken = await this.jwtService.signAsync(payload);

    return { access_token: accessToken, user: finalUser };
  }

  async getUserContext(loginId: string) {
    try { return await this.api.request(this.DOMAIN, 'get', 'context', undefined, { loginId }); } catch (e) { return null; }
  }
  async saveUserContext(loginId: string, site: string, sdwt: string) {
    return await this.api.request(this.DOMAIN, 'post', 'context', { loginId, site, sdwt });
  }
  async getAccessCodes() { return await this.api.request(this.DOMAIN, 'get', 'access-codes'); }
  async createGuestRequest(data: GuestRequestDto) { return await this.api.request(this.DOMAIN, 'post', 'guest-request', data); }
}

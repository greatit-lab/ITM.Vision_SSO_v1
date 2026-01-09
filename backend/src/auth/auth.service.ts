// backend/src/auth/auth.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';
import type { User, LoginResult } from './auth.interface';
import { GuestRequestDto } from './auth.controller';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly baseUrl: string;

  constructor(
    private jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // 환경 변수 필수 체크 (누락 시 에러 발생)
    const apiHost = this.configService.getOrThrow<string>('DATA_API_HOST');
    this.baseUrl = `${apiHost}/api/auth`;
  }

  // ==========================
  // [Helper] 공통 API 요청
  // ==========================
  private stringifyErrorData(data: unknown): string {
    if (typeof data === 'string') return data;
    if (data instanceof Object) return JSON.stringify(data);
    return 'Unknown Error';
  }

  private async requestApi<T>(
    method: 'get' | 'post' | 'patch' | 'delete',
    endpoint: string,
    params?: unknown,
    data?: unknown,
    ignore404 = false, // 404 에러 시 null 반환 옵션
  ): Promise<T | null> {
    const targetPath = `${this.baseUrl}/${endpoint}`;

    try {
      this.logger.debug(`[Requesting ${method.toUpperCase()}] ${targetPath}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetPath,
          params,
          data,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;
        const statusCode = axiosError.response?.status ?? 500;

        // 404 무시 옵션이 켜져있으면 null 반환 (예: 관리자 여부 체크 등)
        if (ignore404 && statusCode === 404) {
          return null;
        }

        const errorMessage = this.stringifyErrorData(axiosError.response?.data);
        this.logger.error(
          `[Data API Error] ${statusCode} - ${targetPath} / ${errorMessage}`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to communicate with Data API',
      );
    }
  }

  // ==========================
  // [Core] Login Logic
  // ==========================
  async login(user: User): Promise<LoginResult> {
    const rawUserId = user.userId;
    this.logger.log(
      `[LOGIN START] Processing login for Raw UserID: '${rawUserId}'`,
    );

    let isWhitelisted = false;

    // 1. Whitelist Check (Access Code)
    try {
      if (user.companyCode) {
        const companyAuth = await this.requestApi<{ isActive: string }>(
          'get',
          'whitelist/check',
          { compId: user.companyCode },
          undefined,
          true,
        );
        if (companyAuth?.isActive === 'Y') isWhitelisted = true;
      }

      if (user.department && !isWhitelisted) {
        const deptAuth = await this.requestApi<{ isActive: string }>(
          'get',
          'whitelist/check',
          { deptId: user.department },
          undefined,
          true,
        );
        if (deptAuth?.isActive === 'Y') isWhitelisted = true;
      }
    } catch (e) {
      this.logger.error(`[Whitelist Check Error] ${e}`);
    }

    // 2. User Sync (Create or Update)
    let dbLoginId = rawUserId;
    try {
      // Data API가 insert/update 로직을 수행하고 최종 유저 정보를 반환한다고 가정
      const syncedUser = await this.requestApi<{ loginId: string }>(
        'post',
        'user/sync',
        undefined,
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
      // (1) Admin Check
      const adminUser = await this.requestApi<{ role: string }>(
        'get',
        'admin/check',
        { loginId: dbLoginId },
        undefined,
        true,
      );

      if (adminUser) {
        role = adminUser.role.toUpperCase();
      } else {
        // (2) Guest Check
        const guestUser = await this.requestApi<{ grantedRole: string }>(
          'get',
          'guest/check',
          { loginId: dbLoginId },
          undefined,
          true,
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
      // 신청 상태 확인
      try {
        const lastRequest = await this.requestApi<{ status: string }>(
          'get',
          'guest-request/status',
          { loginId: dbLoginId },
          undefined,
          true,
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
      const userContext = await this.requestApi<{
        sdwtInfo: { site: string; sdwt: string };
      }>('get', 'user/context', { loginId: dbLoginId }, undefined, true);

      if (userContext?.sdwtInfo) {
        contextSite = userContext.sdwtInfo.site;
        contextSdwt = userContext.sdwtInfo.sdwt;
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

  async saveUserContext(loginId: string, site: string, sdwt: string) {
    // API 호출로 Context 저장 위임
    try {
      return await this.requestApi(
        'post',
        'user/context',
        undefined,
        { loginId, site, sdwt },
      );
    } catch (e) {
      throw new NotFoundException(`Invalid Site or SDWT or User: ${e}`);
    }
  }

  async getAccessCodes() {
    return await this.requestApi('get', 'access-codes');
  }

  async createGuestRequest(data: GuestRequestDto) {
    this.logger.log(`[GUEST REQUEST] New request from ${data.loginId}`);
    // Data API에서 중복 체크 및 생성 로직 수행
    return await this.requestApi('post', 'guest-request', undefined, data);
  }
}

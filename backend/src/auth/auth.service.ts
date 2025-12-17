// backend/src/auth/auth.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common'; // [수정] UnauthorizedException 제거
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { User, LoginResult } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(user: User): Promise<LoginResult> {
    // ----------------------------------------------------
    // [Gate 2] 접근 허용 확인 (회사코드 or 부서코드)
    // ----------------------------------------------------
    // 민감 정보는 저장하지 않고, 오직 화이트리스트 매칭 여부만 확인
    
    // 1. 회사 코드 확인
    const allowedCompany = await this.prisma.refAccessCode.findFirst({
      where: { code: user.companyCode, type: 'COMPANY', isActive: 'Y' }
    });

    // 2. 부서 코드 (부서명) 확인 (회사 코드가 없을 경우 2차 확인)
    let isAllowed = !!allowedCompany;
    if (!isAllowed && user.department) {
      const allowedDept = await this.prisma.refAccessCode.findFirst({
        where: { code: user.department, type: 'DEPT', isActive: 'Y' }
      });
      isAllowed = !!allowedDept;
    }

    if (!isAllowed) {
      // 403 Forbidden: 인증은 되었으나 접근 권한이 없음
      throw new ForbiddenException('Access Denied: Your Company or Department is not authorized.');
    }

    // ----------------------------------------------------
    // [Gate 3] 사용자 식별 및 통계 (SysUser)
    // ----------------------------------------------------
    // 개인정보 없이 식별자(LoginId)와 통계만 저장
    
    const sysUser = await this.prisma.sysUser.findUnique({
      where: { loginId: user.userId },
    });

    if (sysUser) {
      // 기존 유저: 접속 횟수 증가 및 마지막 접속일 갱신
      await this.prisma.sysUser.update({
        where: { loginId: user.userId },
        data: {
          loginCount: { increment: 1 },
          lastLoginAt: new Date(),
        },
      });
    } else {
      // 신규 유저: 최초 생성 (LoginCount = 1)
      await this.prisma.sysUser.create({
        data: {
          loginId: user.userId,
          loginCount: 1,
        },
      });
    }

    // ----------------------------------------------------
    // [Gate 4] 권한(Role) 결정
    // ----------------------------------------------------
    let role = 'USER'; // 기본 권한

    // 1. 관리자 테이블 확인
    const adminUser = await this.prisma.cfgAdminUser.findUnique({
      where: { loginId: user.userId },
    });

    if (adminUser) {
      role = adminUser.role; // 'ADMIN' or 'MANAGER'
    } else {
      // 2. 게스트 테이블 확인 (기간 유효성 체크)
      const guestUser = await this.prisma.cfgGuestAccess.findFirst({
        where: {
          loginId: user.userId,
          validUntil: { gte: new Date() }, // 만료일이 현재보다 미래인 경우
        },
      });

      if (guestUser) {
        role = guestUser.grantedRole; // 'GUEST' etc.
      }
    }

    // ----------------------------------------------------
    // [Token] JWT 발급
    // ----------------------------------------------------
    const payload = { 
      username: user.userId, 
      sub: user.userId, 
      role: role, // 토큰에 역할 정보 포함
      groups: user.groups 
    };
    
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: { ...user, role }, // 프론트엔드에 Role 전달
    };
  }
}

// backend/src/auth/jwt-auth.guard.ts
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    // [수정] 데모 모드 활성화 시 인증 건너뛰기
    if (process.env.ENABLE_DEMO_MODE === 'true') {
      // getRequest에 제네릭 타입 <{ user: any }>을 지정하여 타입 안전성 확보
      const request = context.switchToHttp().getRequest<{ user: any }>();
      
      // 가상 사용자(Mock User) 주입
      // 컨트롤러에서 req.user를 참조할 때 에러가 나지 않도록 필수 필드 포함
      request.user = {
        userId: 'demo_user',
        username: 'Demo User',
        name: 'Demo User',
        email: 'demo@itm.com',
        role: 'USER', 
        groups: ['Users'], 
        companyCode: 'ITM',
        department: 'Dev Team',
        site: 'Hanam',
      };
      
      // this.logger.debug('Demo Mode Enabled: Skipping JWT Validation');
      return true; // 인증 통과
    }

    // 데모 모드가 아닐 경우 기존 JWT 인증 로직 수행
    return super.canActivate(context);
  }
}

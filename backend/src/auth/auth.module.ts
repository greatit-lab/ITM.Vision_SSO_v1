// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SamlStrategy } from './saml.strategy';

@Module({
  imports: [
    PassportModule,
    // JWT 모듈 설정
    JwtModule.register({
      // .env의 JWT_SECRET을 사용하거나 기본값 사용
      // [주의] 운영 배포 시 .env에 복잡한 JWT_SECRET을 반드시 설정하세요.
      secret: process.env.JWT_SECRET || 'secretKey', 
      signOptions: { expiresIn: '8h' }, // 토큰 만료 시간
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    SamlStrategy, // Provider 등록
  ],
  exports: [
    AuthService, 
    SamlStrategy, // 외부에서 사용할 수 있도록 export
  ],
})
export class AuthModule {}

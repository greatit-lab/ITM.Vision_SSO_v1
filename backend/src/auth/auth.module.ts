// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SamlStrategy } from './saml.strategy';
import { JwtStrategy } from './jwt.strategy'; // [추가]
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'itm-vision-secret-key', // [중요] 환경변수 사용 권장
      signOptions: { expiresIn: '8h' }, // 토큰 만료 시간 (근무시간 고려 8시간)
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SamlStrategy,
    JwtStrategy, // [추가] Provider 등록
    PrismaService,
  ],
})
export class AuthModule {}

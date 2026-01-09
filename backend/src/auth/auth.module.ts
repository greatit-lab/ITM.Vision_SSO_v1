// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // [추가]
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SamlStrategy } from './saml.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'itm-vision-secret-key',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SamlStrategy,
    JwtStrategy,
    // PrismaService 제거됨
  ],
})
export class AuthModule {}

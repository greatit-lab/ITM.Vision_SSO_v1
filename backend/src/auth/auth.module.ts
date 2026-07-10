// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // [추가]
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SamlStrategy } from './saml.strategy';
import { JwtStrategy } from './jwt.strategy';
// [추가] 게스트 권한 신청 알림 메일 발송용
import { KnoxModule } from '../knox/knox.module';
import { MailRecipientModule } from '../mail-recipient/mail-recipient.module';

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
    // [추가] KnoxMailService, MailRecipientService 제공
    KnoxModule,
    MailRecipientModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SamlStrategy,
    JwtStrategy,
    // PrismaService 제거됨
  ],
  exports: [AuthService],
})
export class AuthModule {}

// backend/src/error/error.module.ts
import { Module } from '@nestjs/common';
import { ErrorController } from './error.controller';
import { ErrorService } from './error.service';
import { PrismaService } from '../prisma.service'; // [중요] PrismaService 임포트

@Module({
  controllers: [ErrorController],
  // [수정] providers 목록에 PrismaService 추가
  providers: [ErrorService, PrismaService],
})
export class ErrorModule {}

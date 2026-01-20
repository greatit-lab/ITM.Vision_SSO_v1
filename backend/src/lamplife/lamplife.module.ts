// backend/src/lamplife/lamplife.module.ts
import { Module } from '@nestjs/common';
import { LamplifeController } from './lamplife.controller'; // [수정] LampLife -> Lamplife
import { LamplifeService } from './lamplife.service';       // [수정] LampLife -> Lamplife
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [LamplifeController], // [수정] 클래스명 일치
  providers: [LamplifeService],       // [수정] 클래스명 일치
})
export class LampLifeModule {}

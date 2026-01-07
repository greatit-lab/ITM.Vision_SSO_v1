// backend/src/wafer/wafer.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WaferService } from './wafer.service';
import { WaferController } from './wafer.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 대용량 데이터 조회를 위해 타임아웃 30초로 넉넉하게 설정
      maxRedirects: 5,
    }),
  ],
  controllers: [WaferController],
  providers: [WaferService],
})
export class WaferModule {}

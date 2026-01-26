// ITM-Data-API/src/manual/manual.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // [중요] HTTP 통신 모듈
import { ManualController } from './manual.controller';
import { ManualService } from './manual.service';

@Module({
  imports: [HttpModule], // HttpService 사용을 위해 import
  controllers: [ManualController],
  providers: [ManualService],
})
export class ManualModule {}

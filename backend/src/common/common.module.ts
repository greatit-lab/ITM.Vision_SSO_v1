// backend/src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DataApiService } from './data-api.service';

@Global() // 다른 모듈에서 import 없이 DataApiService 주입 가능
@Module({
  imports: [HttpModule],
  providers: [DataApiService],
  exports: [DataApiService, HttpModule],
})
export class CommonModule {}

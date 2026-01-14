// backend/src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DataApiService } from './data-api.service';

@Global()
@Module({
  imports: [
    ConfigModule, // ConfigService 사용
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [DataApiService],
  exports: [DataApiService],
})
export class CommonModule {}

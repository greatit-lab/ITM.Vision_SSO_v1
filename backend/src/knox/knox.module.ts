// backend/src/knox/knox.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KnoxMailService } from './knox-mail.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [KnoxMailService],
  exports: [KnoxMailService],
})
export class KnoxModule {}

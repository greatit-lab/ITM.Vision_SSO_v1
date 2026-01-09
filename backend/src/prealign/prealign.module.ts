// backend/src/prealign/prealign.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PreAlignController } from './prealign.controller';
import { PreAlignService } from './prealign.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PreAlignController],
  providers: [PreAlignService],
})
export class PreAlignModule {}

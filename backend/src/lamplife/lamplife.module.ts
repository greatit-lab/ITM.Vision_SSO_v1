// backend/src/lamplife/lamplife.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LampLifeController } from './lamplife.controller';
import { LampLifeService } from './lamplife.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [LampLifeController],
  providers: [LampLifeService],
})
export class LampLifeModule {}

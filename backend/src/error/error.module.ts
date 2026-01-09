// backend/src/error/error.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ErrorController } from './error.controller';
import { ErrorService } from './error.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ErrorController],
  providers: [ErrorService],
})
export class ErrorModule {}

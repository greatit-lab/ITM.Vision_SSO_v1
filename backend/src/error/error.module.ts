// backend/src/error/error.module.ts
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module'; // [핵심] DataApiService 사용을 위해 필요
import { ErrorController } from './error.controller';
import { ErrorService } from './error.service';

@Module({
  imports: [
    CommonModule, // [수정] HttpModule 대신 CommonModule 사용
  ],
  controllers: [ErrorController], // [중요] 컨트롤러 등록 확인
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}

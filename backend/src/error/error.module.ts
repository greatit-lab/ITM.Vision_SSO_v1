// backend/src/error/error.module.ts
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module'; // [핵심] DataApiService 사용을 위해 임포트
import { ErrorController } from './error.controller';
import { ErrorService } from './error.service';

@Module({
  imports: [
    CommonModule, // [수정] HttpModule 대신 CommonModule을 사용하여 DataApiService 의존성 해결
  ],
  controllers: [ErrorController],
  providers: [ErrorService],
  exports: [ErrorService], // [추가] 다른 모듈에서 ErrorService를 사용할 수 있도록 내보내기
})
export class ErrorModule {}

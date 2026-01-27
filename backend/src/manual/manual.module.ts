// backend/src/manual/manual.module.ts
import { Module } from '@nestjs/common';
import { ManualController } from './manual.controller';
import { ManualService } from './manual.service';
import { CommonModule } from '../common/common.module'; // [수정] CommonModule 추가

@Module({
  imports: [CommonModule], // [수정] DataApiService 사용을 위해 CommonModule 등록
  controllers: [ManualController],
  providers: [ManualService],
})
export class ManualModule {}

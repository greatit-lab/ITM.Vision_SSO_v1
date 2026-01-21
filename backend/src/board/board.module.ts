// backend/src/board/board.module.ts
import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { CommonModule } from '../common/common.module'; // DataApiService 사용을 위해 임포트

@Module({
  imports: [CommonModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}

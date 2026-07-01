// backend/src/board/board.module.ts
import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { CommonModule } from '../common/common.module';
// [추가] KnoxModule, MailRecipientModule import
import { KnoxModule } from '../knox/knox.module';
import { MailRecipientModule } from '../mail-recipient/mail-recipient.module';

@Module({
  imports: [
    CommonModule,
    KnoxModule, // [추가] KnoxMailService 제공
    MailRecipientModule, // [추가] MailRecipientService 제공
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}

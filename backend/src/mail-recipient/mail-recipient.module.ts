// backend/src/mail-recipient/mail-recipient.module.ts
import { Module } from '@nestjs/common';
import { MailRecipientController } from './mail-recipient.controller';
import { MailRecipientService } from './mail-recipient.service';

@Module({
  controllers: [MailRecipientController],
  providers: [MailRecipientService],
  exports: [MailRecipientService],
})
export class MailRecipientModule {}

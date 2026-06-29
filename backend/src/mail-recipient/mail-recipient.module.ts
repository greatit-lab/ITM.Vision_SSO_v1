// backend/src/mail-recipient/mail-recipient.module.ts
import { Module } from '@nestjs/common';
import { MailREcipientController } from './mail-recipient.controller';
import { MailREcipientService } from './mail-recipient.service';

@Module({
  controllers: [MailRecipientController],
  providers: [MailRecipientService],
  exports: [MailRecipientService],
})
export class MailRecipientModuleP {}

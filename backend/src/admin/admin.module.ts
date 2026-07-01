// backend/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
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
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

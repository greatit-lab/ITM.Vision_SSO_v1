// backend/src/alert/alert.module.ts
import { Module } from '@nestjs/common';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { CommonModule } from '../common/common.module'; // [필수] DataApiService 사용

@Module({
  imports: [CommonModule],
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}

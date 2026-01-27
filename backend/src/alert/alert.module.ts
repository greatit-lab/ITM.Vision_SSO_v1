// backend/src/alert/alert.module.ts
import { Module } from '@nestjs/common';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule], // DataApiService 사용을 위해 필수
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}

// backend/src/equipment/equipment.module.ts
import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
// [삭제] import { HttpModule } from '@nestjs/axios';
// [삭제] import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // [중요] DataApiService를 쓰기 위해 필요 (AppModule에서 Global로 등록했다면 생략 가능)
    // CommonModule, 
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
})
export class EquipmentModule {}

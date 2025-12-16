// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Modules
import { EquipmentModule } from './equipment/equipment.module';
import { PreAlignModule } from './prealign/prealign.module';
import { LampLifeModule } from './lamplife/lamplife.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module'; // [추가] AuthModule 임포트

// Controllers & Services
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { PerformanceController } from './performance/performance.controller';
import { PerformanceService } from './performance/performance.service';
import { ErrorController } from './error/error.controller';
import { ErrorService } from './error/error.service';
import { FiltersController } from './filters/filters.controller';
import { FiltersService } from './filters/filters.service';
import { WaferController } from './wafer/wafer.controller';
import { WaferService } from './wafer/wafer.service';

@Module({
  imports: [
    EquipmentModule, 
    PreAlignModule, 
    LampLifeModule, 
    HealthModule,
    AuthModule, // [추가] 여기에 AuthModule을 반드시 등록해야 합니다!
  ],
  controllers: [
    DashboardController,
    PerformanceController,
    ErrorController,
    FiltersController,
    WaferController,
  ],
  providers: [
    PrismaService,
    DashboardService,
    PerformanceService,
    ErrorService,
    FiltersService,
    WaferService,
  ],
})
export class AppModule {}

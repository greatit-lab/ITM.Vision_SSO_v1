// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module'; // [추가]

// --- Feature Modules ---
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ErrorModule } from './error/error.module';
import { FiltersModule } from './filters/filters.module';
import { HealthModule } from './health/health.module';
import { LampLifeModule } from './lamplife/lamplife.module';
import { MenuModule } from './menu/menu.module';
import { PerformanceModule } from './performance/performance.module';
import { PreAlignModule } from './prealign/prealign.module';
import { WaferModule } from './wafer/wafer.module';
import { InfraModule } from './infra/infra.module';

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production', '.env'],
    }),

    // [중요] Common Module (DataApiService) 등록
    CommonModule,

    // Business Modules
    AdminModule,
    AuthModule,
    DashboardModule,
    EquipmentModule,
    ErrorModule,
    FiltersModule,
    HealthModule,
    LampLifeModule,
    MenuModule,
    PerformanceModule,
    PreAlignModule,
    WaferModule,
    InfraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
    // Global Config (Process Env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production', '.env'],
    }),

    // Business Modules (All Refactored to use Data API)
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
  providers: [], // [제거] PrismaService
})
export class AppModule {}

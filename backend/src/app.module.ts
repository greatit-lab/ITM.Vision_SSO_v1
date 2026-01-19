// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';

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
    // 1. 환경 변수 설정 (Global)
    // [개선] 운영 서버(PM2)에서 .env 파일 인식을 강화하기 위해 경로 명시
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production', '.env', '.env.development'],
    }),

    // 2. 공통 모듈 (DataApiService 포함 - 핵심 통신 모듈)
    CommonModule,

    // 3. 비즈니스 모듈 (이제 모두 Data API를 바라봄)
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

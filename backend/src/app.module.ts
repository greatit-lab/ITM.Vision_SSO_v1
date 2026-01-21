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
// [수정] 대소문자 수정 (PrealignModule -> PreAlignModule)
import { PreAlignModule } from './prealign/prealign.module'; 
import { WaferModule } from './wafer/wafer.module';
import { InfraModule } from './infra/infra.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [
    // 1. 환경 변수 설정 (Global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production', '.env', '.env.development'],
    }),

    // 2. 공통 모듈
    CommonModule,

    // 3. 비즈니스 모듈
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
    PreAlignModule, // [수정] 클래스명 일치시킴
    WaferModule,
    InfraModule,
    BoardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

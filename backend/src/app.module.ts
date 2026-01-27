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
import { BoardModule } from './board/board.module';
// [추가] 새로 생성한 모듈 Import
import { ManualModule } from './manual/manual.module';
import { AlertModule } from './alert/alert.module';

@Module({
  imports: [
    // 1. 환경 변수 설정
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
    PreAlignModule,
    WaferModule,
    InfraModule,
    BoardModule,
    ManualModule, // [필수] 매뉴얼 기능 활성화
    AlertModule,  // [필수] 알림 기능 활성화 (404 해결)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

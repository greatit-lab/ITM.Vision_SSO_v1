// backend/src/app.module.ts
import * as path from 'path';
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
import { ManualModule } from './manual/manual.module';
import { AlertModule } from './alert/alert.module';
import { AgentModule } from './agent/agent.module';
// [신규] Knox Portal 메일 연동 모듈
import { KnoxModule } from './knox/knox.module';
import { MailRecipientModule } from './mail-recipient/mail-recipient.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(
        __dirname,
        '..',
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      ),
    }),

    CommonModule,

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
    ManualModule,
    AlertModule,
    AgentModule,
    // [신규] Knox Portal 메일 연동 모듈 추가
    KnoxModule,
    MailRecipientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // [추가] TypeORM
import { PrismaService } from './prisma.service';

// Modules
import { EquipmentModule } from './equipment/equipment.module'; // [추가] 모듈로 분리된 Equipment

// Dashboard (직접 등록 유지)
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

// Other Modules (직접 등록 유지)
import { PerformanceController } from './performance/performance.controller';
import { PerformanceService } from './performance/performance.service';
import { ErrorController } from './error/error.controller';
import { ErrorService } from './error/error.service';
import { FiltersController } from './filters/filters.controller';
import { FiltersService } from './filters/filters.service';

// Wafer Module (직접 등록 유지)
import { WaferController } from './wafer/wafer.controller';
import { WaferService } from './wafer/wafer.service';

@Module({
  imports: [
    // [추가] 1. 데이터베이스 연결 설정 (TypeORM)
    // EquipmentService가 DataSource를 사용하기 위해 필수입니다.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'userid',
      password: 'pw',
      database: 'itm',
      entities: [],
      synchronize: false,
      logging: true,
    }),

    // [추가] 2. EquipmentModule 등록
    // EquipmentController와 EquipmentService는 이제 이 모듈 안에서 관리됩니다.
    EquipmentModule,
  ],
  controllers: [
    DashboardController,
    PerformanceController,
    ErrorController,
    // EquipmentController, // [삭제] EquipmentModule로 이관됨
    FiltersController,
    WaferController,
  ],
  providers: [
    PrismaService,
    DashboardService,
    PerformanceService,
    ErrorService,
    // EquipmentService, // [삭제] EquipmentModule로 이관됨
    FiltersService,
    WaferService,
  ],
})
export class AppModule {}

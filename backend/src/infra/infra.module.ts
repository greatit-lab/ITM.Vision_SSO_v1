// backend/src/infra/infra.module.ts
import { Module } from '@nestjs/common';
import { InfraController } from './infra.controller';
import { InfraService } from './infra.service';

@Module({
  imports: [], // HttpModule 제거 완료
  controllers: [InfraController],
  providers: [InfraService],
})
export class InfraModule {}

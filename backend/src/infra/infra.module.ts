// backend/src/infra/infra.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InfraController } from './infra.controller';
import { InfraService } from './infra.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [InfraController],
  providers: [InfraService],
})
export class InfraModule {}

// backend/src/filters/filters.module.ts
import { Module } from '@nestjs/common';
import { FiltersController } from './filters.controller';
import { FiltersService } from './filters.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FiltersController],
  providers: [FiltersService, PrismaService],
})
export class FiltersModule {}

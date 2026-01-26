// backend/src/manual/manual.controller.ts
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ManualService, ManualItem } from './manual.service'; // 타입 Import
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('manual')
export class ManualController {
  constructor(private readonly manualService: ManualService) {}

  @Get()
  async getManuals(): Promise<ManualItem[]> {
    return await this.manualService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async saveManuals(@Body() body: { sections: ManualItem[] }): Promise<ManualItem[]> {
    return await this.manualService.saveAll(body.sections);
  }
}

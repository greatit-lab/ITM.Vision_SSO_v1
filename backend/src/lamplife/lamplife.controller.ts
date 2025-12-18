// backend/src/lamplife/lamplife.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LampLifeService } from './lamplife.service';

// [수정] 'api/LampLife' -> 'LampLife'
// 프론트엔드/프록시가 '/api'를 처리하므로 백엔드는 'LampLife'로 대기해야 합니다.
@Controller('LampLife')
export class LampLifeController {
  constructor(private readonly lampLifeService: LampLifeService) {}

  @Get()
  async getLampStatus(
    @Query('site') site: string,
    @Query('sdwt') sdwt?: string,
  ) {
    return this.lampLifeService.getLampStatus(site, sdwt);
  }
}

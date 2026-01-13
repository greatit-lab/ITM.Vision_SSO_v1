// backend/src/lamplife/lamplife.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LampLifeService } from './lamplife.service';

@Controller('lamplife')
export class LampLifeController {
  constructor(private readonly lampLifeService: LampLifeService) {}

  // 1. 램프 수명 현황 조회
  @Get('status')
  async getLampLifeStatus(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
  ) {
    // [수정] Service 메서드명 일치 (getLampStatus -> getLampLifeStatus)
    return this.lampLifeService.getLampLifeStatus(site, sdwt);
  }

  // 2. 램프 교체 이력 등록
  @Post('replacement')
  async registerReplacement(
    @Body('eqpId') eqpId: string,
    @Body('date') date?: string,
  ) {
    return this.lampLifeService.registerReplacement(eqpId, date);
  }
}

// backend/src/lamplife/lamplife.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LamplifeService } from './lamplife.service';

@Controller('lamplife')
export class LamplifeController {
  constructor(private readonly lamplifeService: LamplifeService) {}

  // [수정] 프론트엔드 요청(GET /api/lamplife)을 받아 Data-API로 중계
  @Get()
  getLampLifeStatus(
    @Query('site') site: string,
    @Query('sdwt') sdwt?: string,
  ) {
    return this.lamplifeService.getLampLifeStatus(site, sdwt);
  }

  // [수정] 교체 이력 등록 중계
  @Post('replacement')
  registerReplacement(@Body() body: { eqpId: string; date?: string }) {
    return this.lamplifeService.registerReplacement(body);
  }
}

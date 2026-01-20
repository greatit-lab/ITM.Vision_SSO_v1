// backend/src/prealign/prealign.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PreAlignService, PreAlignData } from './prealign.service';

@Controller('prealign')
export class PreAlignController {
  constructor(private readonly preAlignService: PreAlignService) {}

  // 1. PreAlign 트렌드 데이터 조회 (Web -> Backend -> Data-API)
  @Get('trend')
  async getTrend(
    @Query('site') site: string,
    @Query('sdwt') sdwt: string,
    @Query('eqpId') eqpId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<PreAlignData[]> {
    return this.preAlignService.getTrend(
      site,
      sdwt,
      eqpId,
      startDate,
      endDate,
    );
  }
}

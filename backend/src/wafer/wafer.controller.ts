// backend/src/wafer/wafer.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { WaferService, WaferQueryParams } from './wafer.service';

// [수정] 'api/WaferData' -> 'WaferData'
// 프론트엔드/프록시가 '/api'를 처리하므로 백엔드는 'WaferData'로 대기해야 합니다.
@Controller('WaferData')
export class WaferController {
  constructor(private readonly waferService: WaferService) {}

  @Get('flatdata')
  getFlatData(@Query() query: WaferQueryParams) {
    return this.waferService.getFlatData(query);
  }

  @Get('pointdata')
  getPointData(@Query() query: WaferQueryParams) {
    return this.waferService.getPointData(query);
  }

  @Get('statistics')
  getStatistics(@Query() query: WaferQueryParams) {
    return this.waferService.getStatistics(query);
  }

  @Get('checkpdf')
  checkPdf(@Query() query: WaferQueryParams) {
    return this.waferService.checkPdf(query);
  }

  @Get('pdfimage')
  async getPdfImage(@Query() query: WaferQueryParams) {
    return await this.waferService.getPdfImage(query);
  }

  @Get('spectrum')
  getSpectrum(@Query() query: WaferQueryParams) {
    return this.waferService.getSpectrum(query);
  }

  @Get('residual-map')
  getResidualMap(@Query() query: WaferQueryParams) {
    return this.waferService.getResidualMap(query);
  }

  @Get('golden-spectrum')
  getGoldenSpectrum(@Query() query: WaferQueryParams) {
    return this.waferService.getGoldenSpectrum(query);
  }

  @Get('metrics')
  getAvailableMetrics(@Query() query: WaferQueryParams) {
    return this.waferService.getAvailableMetrics(query);
  }

  @Get('trend')
  getLotUniformityTrend(@Query() query: WaferQueryParams & { metric: string }) {
    return this.waferService.getLotUniformityTrend(query);
  }

  @Get('points')
  getPoints(@Query() query: WaferQueryParams) {
    return this.waferService.getDistinctPoints(query);
  }

  @Get('trend/spectrum')
  getSpectrumTrend(@Query() query: WaferQueryParams) {
    return this.waferService.getSpectrumTrend(query);
  }

  @Get('spectrum-gen')
  getSpectrumGen(@Query() query: WaferQueryParams) {
    return this.waferService.getSpectrumGen(query);
  }

  @Get('matching-eqps')
  getMatchingEquipments(@Query() query: WaferQueryParams) {
    return this.waferService.getMatchingEquipments(query);
  }

  @Get('comparison')
  getComparisonData(@Query() query: WaferQueryParams & { targetEqps: string }) {
    return this.waferService.getComparisonData(query);
  }
}

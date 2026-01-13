// backend/src/wafer/wafer.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { WaferService, WaferQueryParams } from './wafer.service';

// [수정] 경로 표준화: 'WaferData' -> 'wafer' (RESTful 표준 및 Frontend API와 일치)
@Controller('wafer')
export class WaferController {
  constructor(private readonly waferService: WaferService) {}

  @Get('flat-data') // flatdata -> flat-data
  getFlatData(@Query() query: WaferQueryParams) {
    return this.waferService.getFlatData(query);
  }

  @Get('point-data') // pointdata -> point-data
  getPointData(@Query() query: WaferQueryParams) {
    return this.waferService.getPointData(query);
  }

  @Get('statistics')
  getStatistics(@Query() query: WaferQueryParams) {
    return this.waferService.getStatistics(query);
  }

  @Get('check-pdf') // checkpdf -> check-pdf
  checkPdf(@Query() query: WaferQueryParams) {
    return this.waferService.checkPdf(query);
  }

  @Get('pdf-image') // pdfimage -> pdf-image
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

  @Get('available-metrics') // metrics -> available-metrics
  getAvailableMetrics(@Query() query: WaferQueryParams) {
    return this.waferService.getAvailableMetrics(query);
  }

  @Get('lot-uniformity-trend') // trend -> lot-uniformity-trend
  getLotUniformityTrend(@Query() query: WaferQueryParams & { metric: string }) {
    return this.waferService.getLotUniformityTrend(query);
  }

  @Get('distinct-points') // points -> distinct-points
  getPoints(@Query() query: WaferQueryParams) {
    return this.waferService.getDistinctPoints(query);
  }

  @Get('spectrum-trend') // trend/spectrum -> spectrum-trend
  getSpectrumTrend(@Query() query: WaferQueryParams) {
    return this.waferService.getSpectrumTrend(query);
  }

  @Get('spectrum-gen')
  getSpectrumGen(@Query() query: WaferQueryParams) {
    return this.waferService.getSpectrumGen(query);
  }

  @Get('matching-equipments') // matching-eqps -> matching-equipments
  getMatchingEquipments(@Query() query: WaferQueryParams) {
    return this.waferService.getMatchingEquipments(query);
  }

  @Get('comparison-data') // comparison -> comparison-data
  getComparisonData(@Query() query: WaferQueryParams & { targetEqps: string }) {
    return this.waferService.getComparisonData(query);
  }

  @Get('optical-trend')
  getOpticalTrend(@Query() query: WaferQueryParams) {
    return this.waferService.getOpticalTrend(query);
  }
  
  @Get('distinct-values')
  getDistinctValues(@Query('field') field: string, @Query() query: WaferQueryParams) {
    return this.waferService.getDistinctValues(field, query);
  }
}

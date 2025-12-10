// backend/src/filters/filters.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersService, FilterQueryDto } from './filters.service';

@Controller('api/Filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  // 1. Site 목록 조회
  @Get('sites')
  getSites() {
    return this.filtersService.getSites();
  }

  // 2. SDWT 목록 조회
  @Get('sdwts/:site')
  getSdwts(@Param('site') site: string) {
    return this.filtersService.getSdwts(site);
  }

  // 3. 통합 필터 조회 (Lot, Wafer, RCP 등 모든 조건)
  // 예: /api/Filters/cassettercps?lotId=...&startDate=...
  // :field 파라미터가 'cassettercps', 'lotids' 등을 받아서 서비스로 넘깁니다.
  @Get(':field')
  getDistinctValues(
    @Param('field') field: string,
    @Query() query: FilterQueryDto,
  ) {
    return this.filtersService.getFilteredDistinctValues(field, query);
  }
}

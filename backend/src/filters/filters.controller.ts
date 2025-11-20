import { Controller, Get, Param } from '@nestjs/common';
import { FiltersService } from './filters.service';

@Controller('api/Filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get('sites')
  getSites() { return this.filtersService.getSites(); }

  @Get('sdwts/:site')
  getSdwts(@Param('site') site: string) { return this.filtersService.getSdwts(site); }
}

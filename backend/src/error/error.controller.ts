import { Controller, Get, Query } from '@nestjs/common';
import { ErrorService } from './error.service';

@Controller('api/ErrorAnalytics')
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  @Get('summary')
  getSummary(@Query() query: any) { return this.errorService.getSummary(query); }

  @Get('trend')
  getTrend(@Query() query: any) { return this.errorService.getTrend(query); }

  @Get('logs')
  getLogs(@Query() query: any) { return this.errorService.getLogs(query); }
}

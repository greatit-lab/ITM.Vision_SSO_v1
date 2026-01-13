// backend/src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

export interface HealthDto {
  eqpId: string;
  totalScore: number;
  status: 'Good' | 'Warning' | 'Critical';
  factors: {
    reliability: number;
    performance: number;
    component: number;
    stability: number;
  };
  details: {
    errorCount: number;
    avgResourceUsage: number;
    lampUsageRatio: number;
    tempVolatility: number;
  };
}

@Injectable()
export class HealthService {
  // [중요] Data API Controller가 대문자 'Health'를 사용함
  private readonly DOMAIN = 'Health';

  constructor(private readonly dataApiService: DataApiService) {}

  async getHealthSummary(site?: string, sdwt?: string): Promise<HealthDto[]> {
    const params: Record<string, string> = {};
    if (site) params.site = site;
    if (sdwt) params.sdwt = sdwt;

    const result = await this.dataApiService.request<HealthDto[]>(
      this.DOMAIN,
      'get',
      'summary',
      undefined,
      params,
    );
    return result || [];
  }
}

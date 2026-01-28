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
  private readonly DOMAIN = 'Health';

  constructor(private readonly dataApiService: DataApiService) {}

  // [수정] baseDate 파라미터 및 로직 제거
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

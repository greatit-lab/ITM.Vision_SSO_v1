// backend/src/lamplife/lamplife.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

export interface LampLifeData {
  eqpId: string;
  usageHours: number;
  remainingLife: number;
  status: 'Good' | 'Warning' | 'Replace';
  lastReplaced: Date | string;
}

@Injectable()
export class LampLifeService {
  private readonly DOMAIN = 'lamplife';

  constructor(private readonly dataApiService: DataApiService) {}

  async getLampLifeStatus(site?: string, sdwt?: string): Promise<LampLifeData[]> {
    const params: Record<string, string> = {};
    if (site) params.site = site;
    if (sdwt) params.sdwt = sdwt;

    // [수정] endpoint를 undefined로 설정하여 Data API의 Root 경로(/api/lamplife) 호출
    const result = await this.dataApiService.request<LampLifeData[]>(
      this.DOMAIN,
      'get',
      undefined, 
      undefined,
      params,
    );
    return result || [];
  }

  async registerReplacement(eqpId: string, date?: string): Promise<void> {
    await this.dataApiService.request(
      this.DOMAIN,
      'post',
      'replacement',
      { eqpId, date },
    );
  }
}

// backend/src/prealign/prealign.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

export interface PreAlignDataRaw {
  timestamp: string | Date;
  xmm: number;
  ymm: number;
  notch: number;
}

@Injectable()
export class PreAlignService {
  private readonly DOMAIN = 'prealign';

  constructor(private readonly dataApiService: DataApiService) {}

  async getData(
    eqpId: string,
    startDate: string,
    endDate: string,
  ): Promise<PreAlignDataRaw[]> {
    const params = {
      eqpId,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    const result = await this.dataApiService.request<PreAlignDataRaw[]>(
      this.DOMAIN,
      'get',
      'data',
      undefined,
      params,
    );
    
    return result || [];
  }
}

// backend/src/prealign/prealign.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [수정] 인터페이스 정의 및 Export
export interface PreAlignData {
  timestamp: string;
  eqpId: string;
  xmm: number;
  ymm: number;
  notch: number;
}

@Injectable()
export class PreAlignService {
  private readonly DOMAIN = 'prealign';
  private readonly logger = new Logger(PreAlignService.name);

  constructor(private readonly dataApiService: DataApiService) {}

  // [수정] Data-API로 트렌드 데이터 요청 중계
  async getTrend(
    site: string,
    sdwt: string,
    eqpId: string,
    startDate: string,
    endDate: string,
  ): Promise<PreAlignData[]> {
    const params = { site, sdwt, eqpId, startDate, endDate };

    try {
      const result = await this.dataApiService.request<PreAlignData[]>(
        this.DOMAIN,
        'get',
        'trend',
        undefined,
        params,
      );
      
      return Array.isArray(result) ? result : [];
    } catch (e) {
      this.logger.warn(`Failed to get prealign trend: ${e instanceof Error ? e.message : String(e)}`);
      return [];
    }
  }
}

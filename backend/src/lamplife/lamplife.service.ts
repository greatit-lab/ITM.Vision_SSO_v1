// backend/src/lamplife/lamplife.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

@Injectable()
export class LamplifeService {
  private readonly logger = new Logger(LamplifeService.name);
  // Data-API의 도메인(Controller Prefix) 정의
  private readonly DOMAIN = 'lamplife';

  constructor(private readonly dataApi: DataApiService) {}

  // 1. 램프 수명 현황 조회 (Data-API로 Proxy)
  async getLampLifeStatus(site: string, sdwt?: string) {
    const params = { site, sdwt };
    // DataApiService가 내부적으로 HTTP 통신을 수행함
    return this.dataApi.request<any[]>(
      this.DOMAIN, 
      'get', 
      '', // 경로 없음 (기본 /lamplife 호출)
      undefined, 
      params
    );
  }

  // 2. 램프 교체 이력 등록 (Data-API로 Proxy)
  async registerReplacement(data: { eqpId: string; date?: string }) {
    return this.dataApi.request(
      this.DOMAIN,
      'post',
      'replacement',
      data
    );
  }
}

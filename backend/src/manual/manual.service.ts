// backend/src/manual/manual.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [Type Definition]
export interface ManualItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  content: string;
  imageUrl?: string;
  sortOrder: number;
  updatedAt: string;
}

@Injectable()
export class ManualService {
  // Data API의 도메인 Prefix 정의
  private readonly DOMAIN = 'manual';

  constructor(private readonly dataApiService: DataApiService) {}

  // [GET] 매뉴얼 목록 조회
  async findAll(): Promise<ManualItem[]> {
    // DataApiService가 환경변수(DATA_API_HOST)와 /api 프리픽스를 자동으로 처리함
    const result = await this.dataApiService.request<ManualItem[]>(
      this.DOMAIN,
      'get',
    );
    return result || [];
  }

  // [PUT] 매뉴얼 전체 저장
  async saveAll(sections: ManualItem[]): Promise<ManualItem[]> {
    const result = await this.dataApiService.request<ManualItem[]>(
      this.DOMAIN,
      'put',
      undefined, // endpoint (기본 루트)
      { sections }, // Body
    );
    return result || [];
  }
}

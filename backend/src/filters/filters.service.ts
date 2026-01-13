// backend/src/filters/filters.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

export class FilterQueryDto {
  eqpId?: string;
  startDate?: string;
  endDate?: string;
  lotId?: string;
  waferId?: string;
  cassetteRcp?: string;
  stageRcp?: string;
  stageGroup?: string;
  film?: string;
}

@Injectable()
export class FiltersService {
  // [중요] Data API Controller가 대문자 'Filters'를 사용함
  private readonly DOMAIN = 'Filters';

  constructor(private readonly dataApiService: DataApiService) {}

  async getSites(): Promise<string[]> {
    const result = await this.dataApiService.request<string[]>(
      this.DOMAIN,
      'get',
      'sites',
    );
    return result || [];
  }

  async getSdwts(site: string): Promise<string[]> {
    const result = await this.dataApiService.request<string[]>(
      this.DOMAIN,
      'get',
      'sdwts',
      undefined,
      { site },
    );
    return result || [];
  }

  async getEqpIdsBySource(
    site: string | undefined,
    sdwt: string | undefined,
    type: string,
  ): Promise<string[]> {
    const params: Record<string, string> = { type };
    if (site) params.site = site;
    if (sdwt) params.sdwt = sdwt;

    const result = await this.dataApiService.request<string[]>(
      this.DOMAIN,
      'get',
      'eqpids-by-source',
      undefined,
      params,
    );
    return result || [];
  }

  async getFilteredDistinctValues(
    field: string,
    query: FilterQueryDto,
  ): Promise<string[]> {
    const params: Record<string, string> = { field };

    // 쿼리 파라미터 정제
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = String(value);
      }
    });

    const result = await this.dataApiService.request<string[]>(
      this.DOMAIN,
      'get',
      'distinct-values',
      undefined,
      params,
      { returnNullOn404: true },
    );
    return result || [];
  }
}

// backend/src/filters/filters.service.ts
import {
  Injectable,
  Logger,
  // [ESLint 수정] 사용하지 않는 Exception 제거
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';

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
  private readonly logger = new Logger(FiltersService.name);
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/filters';

  constructor(private readonly httpService: HttpService) {}

  /**
   * [Core] 공통 GET 요청 핸들러
   */
  private async fetchApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    let finalUrl = 'URL_NOT_GENERATED';
    const targetPath = `${this.DATA_API_BASE}/${endpoint}`;

    try {
      const queryString = new URLSearchParams(params).toString();
      finalUrl = queryString ? `${targetPath}?${queryString}` : targetPath;
      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get<T>(targetPath, { params }),
      );
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, finalUrl);
      return [] as unknown as T; // Default return to prevent crash
    }
  }

  private handleError(error: unknown, url: string): void {
    let errorMessage = 'Unknown Error';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      statusCode = axiosError.response?.status || 500;
      const errorData = axiosError.response?.data;
      errorMessage = errorData ? JSON.stringify(errorData) : axiosError.message;
      
      this.logger.error(`[Data API Error] ${statusCode} - ${url} : ${errorMessage}`);
    } else {
       this.logger.error(`[Data API Error] Unknown - ${url}`);
    }
  }

  async getSites(): Promise<string[]> {
    return this.fetchApi<string[]>('sites');
  }

  async getSdwts(site: string): Promise<string[]> {
    return this.fetchApi<string[]>('sdwts', { site });
  }

  async getEqpIdsBySource(
    site: string | undefined,
    sdwt: string | undefined,
    type: string,
  ): Promise<string[]> {
    const params: Record<string, string> = { type };
    if (site) params.site = site;
    if (sdwt) params.sdwt = sdwt;
    
    return this.fetchApi<string[]>('eqpids-by-source', params);
  }

  async getFilteredDistinctValues(
    field: string,
    query: FilterQueryDto,
  ): Promise<string[]> {
    const params: Record<string, string> = { field };
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
         params[key] = String(value);
      }
    });

    return this.fetchApi<string[]>('distinct-values', params);
  }
}

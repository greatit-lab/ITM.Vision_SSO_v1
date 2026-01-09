// backend/src/health/health.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';

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
  private readonly logger = new Logger(HealthService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiHost = this.configService.get<string>('DATA_API_HOST', 'http://10.135.77.71:8081');
    this.baseUrl = `${apiHost}/api/health`;
  }

  async getHealthSummary(site?: string, sdwt?: string): Promise<HealthDto[]> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = `${this.baseUrl}/summary`;
      const params: Record<string, string> = {};
      if (site) params.site = site;
      if (sdwt) params.sdwt = sdwt;

      const queryString = new URLSearchParams(params).toString();
      finalUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<HealthDto[]> = await firstValueFrom(
        this.httpService.get<HealthDto[]>(targetPath, { params }),
      );

      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Unknown Error';
      let statusCode = 500;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        statusCode = axiosError.response?.status || 500;
        const errorData = axiosError.response?.data;
        errorMessage = errorData
          ? JSON.stringify(errorData)
          : axiosError.message;

        this.logger.error(
          `[Data API Error] ${statusCode} - Failed URL: ${finalUrl} / Msg: ${errorMessage}`,
        );
      } else {
        this.logger.error(
          `[Data API Error] Unknown - Failed URL: ${finalUrl}`,
        );
      }

      if (statusCode === 404) return [];
      
      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }
}

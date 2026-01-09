// backend/src/prealign/prealign.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

export interface PreAlignDataRaw {
  timestamp: string | Date;
  xmm: number;
  ymm: number;
  notch: number;
}

@Injectable()
export class PreAlignService {
  private readonly logger = new Logger(PreAlignService.name);
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/prealign';

  constructor(private readonly httpService: HttpService) {}

  async getData(
    eqpId: string,
    startDate: string,
    endDate: string,
  ): Promise<PreAlignDataRaw[]> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = `${this.DATA_API_BASE}/data`;
      const cleanParams = {
        eqpId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };

      const dummyConfig = {
        params: cleanParams,
        url: targetPath,
      } as InternalAxiosRequestConfig;
      finalUrl = axios.getUri(dummyConfig);

      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<PreAlignDataRaw[]> = await firstValueFrom(
        this.httpService.get<PreAlignDataRaw[]>(targetPath, {
          params: cleanParams,
        }),
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
          `[Data API Error] ${statusCode} - Failed URL: ${finalUrl}`,
        );
      }

      if (statusCode === 404) {
        return [];
      }

      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }
}

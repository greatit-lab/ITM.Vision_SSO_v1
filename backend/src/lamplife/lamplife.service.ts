// backend/src/lamplife/lamplife.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { LampLifeDto } from '../models/LampLifeDto';

@Injectable()
export class LampLifeService {
  private readonly logger = new Logger(LampLifeService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiHost = this.configService.getOrThrow<string>('DATA_API_HOST');
    this.baseUrl = `${apiHost}/api/lamplife`;
  }

  async getLampStatus(site: string, sdwt?: string): Promise<LampLifeDto[]> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = `${this.baseUrl}/status`;
      const params: Record<string, string> = { site };
      if (sdwt) params.sdwt = sdwt;

      finalUrl = `${targetPath}?${new URLSearchParams(params).toString()}`;
      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<LampLifeDto[]> = await firstValueFrom(
        this.httpService.get<LampLifeDto[]>(targetPath, { params }),
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
          `[Data API Error] Unknown error occurred - Failed URL: ${finalUrl}`,
        );
      }
      
      return [];
    }
  }
}

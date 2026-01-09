// backend/src/lamplife/lamplife.service.ts
import {
  Injectable,
  Logger,
  // [ESLint 수정] 사용하지 않는 InternalServerErrorException 제거
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { LampLifeDto } from '../models/LampLifeDto';

@Injectable()
export class LampLifeService {
  private readonly logger = new Logger(LampLifeService.name);
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/lamplife';

  constructor(private readonly httpService: HttpService) {}

  async getLampStatus(site: string, sdwt?: string): Promise<LampLifeDto[]> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = `${this.DATA_API_BASE}/status`;
      const params: Record<string, string> = { site };
      if (sdwt) params.sdwt = sdwt;

      finalUrl = `${targetPath}?${new URLSearchParams(params).toString()}`;
      this.logger.debug(`[Requesting] ${finalUrl}`);

      const response: AxiosResponse<LampLifeDto[]> = await firstValueFrom(
        this.httpService.get<LampLifeDto[]>(targetPath, { params }),
      );

      return response.data;
    } catch (error: unknown) {
      // [ESLint 수정] errorMessage 변수 활용 및 로깅 로직 개선
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
      
      // 실패 시 빈 배열 반환하여 대시보드 중단 방지
      return [];
    }
  }
}

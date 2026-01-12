// backend/src/common/data-api.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';

export interface RequestOptions {
  returnNullOn404?: boolean; // 404 에러 발생 시 에러 대신 null 반환 여부
}

@Injectable()
export class DataApiService {
  private readonly logger = new Logger(DataApiService.name);
  private readonly dataApiHost: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dataApiHost = this.configService.getOrThrow<string>('DATA_API_HOST');
  }

  async request<T>(
    domain: string,
    method: 'get' | 'post' | 'patch' | 'delete' | 'put',
    endpoint: string = '',
    data?: unknown,
    params?: unknown,
    options?: RequestOptions,
  ): Promise<T | null> {
    const baseUrl = `${this.dataApiHost}/api/${domain}`;
    const targetUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;

    try {
      this.logger.debug(
        `[Data API Request] ${method.toUpperCase()} ${targetUrl}`,
      );

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetUrl,
          data,
          params,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      // 404 무시 옵션이 있고, 실제 404 에러인 경우 null 반환
      if (
        options?.returnNullOn404 &&
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        return null;
      }

      this.handleError(error, targetUrl);
      return null; // 실행되지 않음
    }
  }

  private handleError(error: unknown, url: string): void {
    let errorMessage = 'Unknown Error';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      statusCode = axiosError.response?.status ?? 500;
      const errorData = axiosError.response?.data;

      // errorData가 존재하는 경우 처리
      if (errorData !== undefined && errorData !== null) {
        if (typeof errorData === 'object') {
          // 객체인 경우 JSON 문자열로 변환
          try {
            errorMessage = JSON.stringify(errorData);
          } catch {
            errorMessage = '[Circular or Unserializable Object]';
          }
        } else {
          // [Fix] ESLint 오류 해결: any 타입을 명시적인 원시 타입(string|number|boolean)으로 단언하여 String() 호출
          errorMessage = String(errorData as string | number | boolean);
        }
      } else {
        errorMessage = axiosError.message;
      }

      this.logger.error(
        `[Data API Error] ${statusCode} - ${url} / ${errorMessage}`,
      );
    } else {
      const sysErrorMsg =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[System Error] ${url} / ${sysErrorMsg}`);
      errorMessage = sysErrorMsg;
    }

    throw new InternalServerErrorException(
      `Data API Proxy Error: ${errorMessage}`,
    );
  }
}

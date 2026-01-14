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
import * as https from 'https';

/**
 * Data API 요청 시 사용할 추가 옵션
 */
export interface RequestOptions {
  returnNullOn404?: boolean; // 404 에러 발생 시 Exception 대신 null 반환 여부
}

// 에러 객체의 타입 정의 (ESLint unsafe 에러 방지용)
interface ErrorPayload {
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

@Injectable()
export class DataApiService {
  private readonly logger = new Logger(DataApiService.name);
  private readonly dataApiHost: string;
  
  // SSL 검증 무시를 위한 에이전트 생성
  private readonly httpsAgent = new https.Agent({  
    rejectUnauthorized: false 
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dataApiHost = this.configService.getOrThrow<string>('DATA_API_HOST');
  }

  async request<T>(
    domain: string,
    method: 'get' | 'post' | 'patch' | 'delete' | 'put',
    endpoint: string | undefined = '',
    data?: unknown,
    params?: unknown,
    options?: RequestOptions,
  ): Promise<T | null> {
    const safeEndpoint = endpoint || '';
    const baseUrl = `${this.dataApiHost}/api/${domain}`;
    const targetUrl = safeEndpoint ? `${baseUrl}/${safeEndpoint}` : baseUrl;

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
          httpsAgent: this.httpsAgent, 
        }),
      );

      return response.data;
    } catch (error: unknown) {
      if (
        options?.returnNullOn404 &&
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        this.logger.warn(`[Data API] 404 Not Found (Ignored): ${targetUrl}`);
        return null;
      }

      this.handleError(error, targetUrl);
      return null;
    }
  }

  private handleError(error: unknown, url: string): void {
    let errorMessage = 'Unknown Error';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      statusCode = axiosError.response?.status ?? 500;
      
      // unknown으로 타입 단언하여 unsafe 에러 방지
      const errorData = axiosError.response?.data as unknown;

      if (errorData !== undefined && errorData !== null) {
        if (typeof errorData === 'object') {
          // 객체인 경우 ErrorPayload 인터페이스로 단언하여 안전한 접근 보장
          const payload = errorData as ErrorPayload;

          if (payload.message) {
             errorMessage = Array.isArray(payload.message) 
                ? payload.message.join(', ') 
                : String(payload.message);
          } else {
             // message 속성이 없는 객체인 경우 JSON 문자열화 시도
             try {
               errorMessage = JSON.stringify(payload);
             } catch {
               errorMessage = '[Circular or Unserializable Object]';
             }
          }
        } else {
          // [수정] 원시 타입인 경우: ESLint 'no-base-to-string' 에러 해결을 위해 타입 명시
          // 이미 typeof === 'object' 체크를 통과했으므로 여기서는 원시 타입임이 확실함
          errorMessage = String(errorData as string | number | boolean);
        }
      } else {
        errorMessage = axiosError.message;
      }

      this.logger.error(
        `[Data API Error] ${statusCode} - ${url} / Msg: ${errorMessage}`,
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

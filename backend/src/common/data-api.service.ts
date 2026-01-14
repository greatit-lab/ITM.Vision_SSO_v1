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
import * as http from 'http';
import * as https from 'https';

/**
 * Data API 요청 옵션
 */
export interface RequestOptions {
  returnNullOn404?: boolean;
}

/**
 * Axios Error Payload 타입
 */

@Injectable()
export class DataApiService {
  private readonly logger = new Logger(DataApiService.name);
  private readonly dataApiHost: string;

  /**
   * 내부망 HTTP Agent (keep-alive)
   */
  private readonly httpAgent = new http.Agent({
    keepAlive: true,
  });

  /**
   * 내부망 HTTPS Agent (SSL 검증 무시)
   * ※ 사내 인증서 환경 고려
   */
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dataApiHost = this.configService.get<string>('DATA_API_HOST') || '';

    if (!this.dataApiHost) {
      throw new Error('[DataApiService] DATA_API_HOST is not defined');
    }

    this.logger.log(
      `[DataApiService] Initialized with DATA_API_HOST=${this.dataApiHost}`,
    );
  }

  /**
   * 공통 Data API 요청 메서드
   */
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
        `[Data API Request] ${method.toUpperCase()} ${targetUrl}` +
          (params ? ` | params=${JSON.stringify(params)}` : ''),
      );

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetUrl,
          data,
          params,
          httpAgent: this.httpAgent,
          httpsAgent: this.httpsAgent,

          /**
           * 🔥 핵심 수정
           * 사내 HTTP_PROXY / HTTPS_PROXY 강제 무시
           */
          proxy: false,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      // 404 무시 옵션 처리
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

  /**
   * 공통 에러 처리
   */
  private handleError(error: unknown, url: string): void {
    let errorMessage = 'Unknown Error';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      statusCode = axiosError.response?.status ?? 500;

      const errorData = axiosError.response?.data;

      if (errorData !== undefined && errorData !== null) {
        if (typeof errorData === 'object') {
          // 객체 → JSON stringify
          try {
            errorMessage = JSON.stringify(errorData);
          } catch {
            errorMessage = '[Unserializable Error Object]';
          }
        } else if (
          typeof errorData === 'string' ||
          typeof errorData === 'number' ||
          typeof errorData === 'boolean'
        ) {
          // 원시 타입 → 안전한 문자열 변환
          errorMessage = String(errorData);
        } else {
          // 그 외 타입 (symbol, function 등)
          errorMessage = '[Unsupported Error Data Type]';
        }
      } else {
        errorMessage = axiosError.message;
      }

      this.logger.error(
        `[Data API Error] ${statusCode} ${url} | ${errorMessage}`,
      );
    } else {
      const sysMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`[System Error] ${url} | ${sysMessage}`);

      errorMessage = sysMessage;
    }

    throw new InternalServerErrorException(
      `Data API Proxy Error: ${errorMessage}`,
    );
  }
}

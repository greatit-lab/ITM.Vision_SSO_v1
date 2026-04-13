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

// [수정] RequestOptions에 token 및 timeout 추가
export interface RequestOptions {
  returnNullOn404?: boolean;
  token?: string; // 인증 토큰 전달용 (옵션)
  timeout?: number; // [추가] 개별 API 타임아웃 설정용 (옵션)
}

@Injectable()
export class DataApiService {
  private readonly logger = new Logger(DataApiService.name);
  private readonly dataApiHost: string;

  private readonly httpAgent = new http.Agent({
    keepAlive: true,
  });

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
      throw new Error('[DataApiService] DATA_API_HOST is not defined in .env');
    }

    this.logger.log(
      `[DataApiService] Initialized with DATA_API_HOST=${this.dataApiHost}`,
    );
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

    const token = options?.token;

    try {
      this.logger.debug(
        `[Data API Request] ${method.toUpperCase()} ${targetUrl}` +
          (params ? ` | params=${JSON.stringify(params)}` : '') +
          (token ? ` | [Token Provided]` : ''),
      );

      const headers: Record<string, string> = {};
      
      if (token) {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = authHeader;
      }

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetUrl,
          data,
          params,
          headers,
          httpAgent: this.httpAgent,
          httpsAgent: this.httpsAgent,
          proxy: false,
          // [핵심 수정] 기본값을 100,000ms(100초)에서 300,000ms(300초/5분)으로 연장
          // 필요시 호출부에서 options.timeout 으로 덮어씌울 수 있습니다.
          timeout: options?.timeout || 300000, 
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
      const errorData = axiosError.response?.data;

      if (errorData !== undefined && errorData !== null) {
        if (typeof errorData === 'object') {
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
          errorMessage = String(errorData);
        } else {
          errorMessage = '[Unsupported Error Data Type]';
        }
      } else {
        errorMessage = axiosError.message;
      }

      // [추가] 타임아웃 발생 시 로그를 좀 더 명확하게 찍어줍니다.
      if (axiosError.code === 'ECONNABORTED') {
        errorMessage = `Request Timeout (${axiosError.message})`;
      }

      this.logger.error(
        `[Data API Error] ${statusCode} ${url} | ${errorMessage}`,
      );
    } else {
      const sysMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[System Error] ${url} | ${sysMessage}`);
      errorMessage = sysMessage;
    }

    throw new InternalServerErrorException(
      `Data API Proxy Error: ${errorMessage}`,
    );
  }
}

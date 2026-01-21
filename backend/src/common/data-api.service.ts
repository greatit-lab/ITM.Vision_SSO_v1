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

export interface RequestOptions {
  returnNullOn404?: boolean;
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

  // [중요] 기존 서비스들과 호환되도록 public request 메서드 유지
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
          proxy: false,
          timeout: 100000, 
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

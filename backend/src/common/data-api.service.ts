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

/**
 * Data API 요청 시 사용할 추가 옵션
 */
export interface RequestOptions {
  returnNullOn404?: boolean; // 404 에러 발생 시 Exception 대신 null 반환 여부
}

@Injectable()
export class DataApiService {
  private readonly logger = new Logger(DataApiService.name);
  private readonly dataApiHost: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // 환경 변수에서 Data API 호스트 주소를 가져옵니다. (예: http://localhost:8081)
    this.dataApiHost = this.configService.getOrThrow<string>('DATA_API_HOST');
  }

  /**
   * Data API로 HTTP 요청을 보냅니다.
   *
   * @param domain - API 도메인 (예: 'equipment', 'user' 등 - Controller 경로)
   * @param method - HTTP 메서드 ('get', 'post', 'patch', 'delete', 'put')
   * @param endpoint - 상세 엔드포인트 (기본값: '')
   * @param data - Body 데이터 (POST, PATCH, PUT 시 사용)
   * @param params - Query String 파라미터
   * @param options - 추가 요청 옵션 (예: 404 무시)
   */
  async request<T>(
    domain: string,
    method: 'get' | 'post' | 'patch' | 'delete' | 'put',
    endpoint: string = '',
    data?: unknown,
    params?: unknown,
    options?: RequestOptions,
  ): Promise<T | null> {
    // URL 조립: {HOST}/api/{DOMAIN}/{ENDPOINT}
    const baseUrl = `${this.dataApiHost}/api/${domain}`;
    const targetUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;

    try {
      this.logger.debug(
        `[Data API Request] ${method.toUpperCase()} ${targetUrl}`,
      );

      // Axios 요청 실행
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetUrl,
          data,    // Request Body
          params,  // Query Params
        }),
      );

      return response.data;
    } catch (error: unknown) {
      // 옵션 처리: 404 에러를 null로 반환하라는 옵션이 켜져 있고, 실제 404인 경우
      if (
        options?.returnNullOn404 &&
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        this.logger.warn(`[Data API] 404 Not Found (Ignored): ${targetUrl}`);
        return null;
      }

      // 그 외 에러는 공통 핸들러로 위임하여 예외 발생
      this.handleError(error, targetUrl);
      return null; // 실행되지 않음 (위에서 throw 됨)
    }
  }

  /**
   * 에러 로그 출력 및 예외 재발생
   */
  private handleError(error: unknown, url: string): void {
    let errorMessage = 'Unknown Error';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      statusCode = axiosError.response?.status ?? 500;
      const errorData = axiosError.response?.data;

      // 에러 메시지 추출 로직
      if (errorData !== undefined && errorData !== null) {
        if (typeof errorData === 'object') {
          // 객체인 경우 JSON 문자열로 변환 시도
          try {
            errorMessage = JSON.stringify(errorData);
          } catch {
            errorMessage = '[Circular or Unserializable Object]';
          }
        } else {
          // 원시 타입(문자열 등)인 경우
          errorMessage = String(errorData as string | number | boolean);
        }
      } else {
        errorMessage = axiosError.message;
      }

      this.logger.error(
        `[Data API Error] ${statusCode} - ${url} / Msg: ${errorMessage}`,
      );
    } else {
      // Axios 에러가 아닌 시스템 에러
      const sysErrorMsg =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[System Error] ${url} / ${sysErrorMsg}`);
      errorMessage = sysErrorMsg;
    }

    // 최종적으로 500 Internal Server Error로 감싸서 던짐
    throw new InternalServerErrorException(
      `Data API Proxy Error: ${errorMessage}`,
    );
  }
}

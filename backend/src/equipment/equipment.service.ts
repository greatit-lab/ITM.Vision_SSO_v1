// backend/src/equipment/equipment.service.ts
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
import { RefEquipment, Prisma } from '@prisma/client';

// DTO 정의
export interface EquipmentDto {
  eqpId: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  lastContact: Date | string | null;
  os: string;
  systemType: string;
  timezone: string;
  macAddress: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  type: string;
  locale: string;
  systemModel: string;
  serialNum: string;
  application: string;
  version: string;
  dbVersion: string;
}

export interface EquipmentQueryParams {
  site?: string;
  sdwt?: string;
  eqpId?: string;
  type?: string;
}

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);
  // Data API의 Equipment 엔드포인트 베이스 URL
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/equipment';

  constructor(private readonly httpService: HttpService) {}

  /**
   * [Core] GET 요청용 공통 Fetcher
   */
  private async fetchFromApi<T>(
    endpoint: string,
    params: EquipmentQueryParams = {},
  ): Promise<T> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = endpoint
        ? `${this.DATA_API_BASE}/${endpoint}`
        : this.DATA_API_BASE;

      const cleanParams: Record<string, string> = {};
      
      // [ESLint 수정] 값의 타입을 명확히 확인하여 변환
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }
        if (typeof value === 'string') {
          cleanParams[key] = value;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          cleanParams[key] = String(value);
        } else if (value instanceof Date) {
          cleanParams[key] = value.toISOString();
        } else {
          // 그 외 객체 타입 등은 JSON 문자열로 변환
          cleanParams[key] = JSON.stringify(value);
        }
      });

      const dummyConfig = {
        params: cleanParams,
        url: targetPath,
      } as InternalAxiosRequestConfig;
      finalUrl = axios.getUri(dummyConfig);

      this.logger.debug(`[Requesting GET] ${finalUrl}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get<T>(targetPath, {
          params: cleanParams,
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, finalUrl);
      return [] as unknown as T;
    }
  }

  /**
   * [Core] Mutation (POST, PATCH, DELETE) 요청용 공통 Method
   * [ESLint 수정] data 타입을 any -> unknown으로 변경하여 unsafe assignment 방지
   */
  private async mutateApi<T>(
    method: 'post' | 'patch' | 'delete',
    endpoint: string,
    data?: unknown, 
  ): Promise<T> {
    const targetPath = endpoint
      ? `${this.DATA_API_BASE}/${endpoint}`
      : this.DATA_API_BASE;

    try {
      this.logger.debug(`[Requesting ${method.toUpperCase()}] ${targetPath}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetPath,
          data, 
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, targetPath);
      throw error;
    }
  }

  private handleError(error: unknown, url: string): void {
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
        `[Data API Error] ${statusCode} - Failed URL: ${url} / Msg: ${errorMessage}`,
      );
    }
    throw new InternalServerErrorException(
      `Data API Proxy Error: ${errorMessage}`,
    );
  }

  // =================================================================
  // 1. [Infra Management] 인프라 관리용 단순 조회
  // =================================================================
  async getInfraList(): Promise<RefEquipment[]> {
    return this.fetchFromApi<RefEquipment[]>('infra');
  }

  // =================================================================
  // 2. [Equipment Explorer] 장비 탐색기/상세용 복잡한 조회
  // =================================================================
  async getDetails(
    site?: string,
    sdwt?: string,
    eqpId?: string,
  ): Promise<EquipmentDto[]> {
    return this.fetchFromApi<EquipmentDto[]>('details', { site, sdwt, eqpId });
  }

  async getEqpIds(
    site?: string,
    sdwt?: string,
    type?: string,
  ): Promise<string[]> {
    return this.fetchFromApi<string[]>('ids', { site, sdwt, type });
  }

  // =================================================================
  // 3. [Basic CRUD] 기본 기능 (Data API로 위임)
  // =================================================================
  async create(data: Prisma.RefEquipmentCreateInput): Promise<RefEquipment> {
    return this.mutateApi<RefEquipment>('post', '', data);
  }

  async findOne(eqpid: string): Promise<RefEquipment | null> {
    return this.fetchFromApi<RefEquipment | null>(eqpid);
  }

  async update(
    eqpid: string,
    data: Prisma.RefEquipmentUpdateInput,
  ): Promise<RefEquipment> {
    return this.mutateApi<RefEquipment>('patch', eqpid, data);
  }

  async remove(eqpid: string): Promise<RefEquipment> {
    return this.mutateApi<RefEquipment>('delete', eqpid);
  }
}

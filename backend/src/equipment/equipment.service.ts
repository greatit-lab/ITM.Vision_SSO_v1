// backend/src/equipment/equipment.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { RefEquipment, Prisma } from '@prisma/client';

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
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiHost = this.configService.get<string>('DATA_API_HOST', 'http://10.135.77.71:8081');
    this.baseUrl = `${apiHost}/api/equipment`;
  }

  private async fetchFromApi<T>(
    endpoint: string,
    params: EquipmentQueryParams = {},
  ): Promise<T> {
    let finalUrl = 'URL_NOT_GENERATED';

    try {
      const targetPath = endpoint
        ? `${this.baseUrl}/${endpoint}`
        : this.baseUrl;

      const cleanParams: Record<string, string> = {};
      
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

  private async mutateApi<T>(
    method: 'post' | 'patch' | 'delete',
    endpoint: string,
    data?: unknown, 
  ): Promise<T> {
    const targetPath = endpoint
      ? `${this.baseUrl}/${endpoint}`
      : this.baseUrl;

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

  async getInfraList(): Promise<RefEquipment[]> {
    return this.fetchFromApi<RefEquipment[]>('infra');
  }

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

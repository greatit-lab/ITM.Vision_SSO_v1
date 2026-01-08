// backend/src/infra/infra.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RefSdwt, CfgServer, Prisma } from '@prisma/client';

@Injectable()
export class InfraService {
  private readonly logger = new Logger(InfraService.name);
  private readonly DATA_API_BASE = 'http://10.135.77.71:8081/api/infra';

  constructor(private readonly httpService: HttpService) {}

  /**
   * [Core] 공통 HTTP 요청 처리 메서드
   * [ESLint 수정] params, data 타입을 any -> unknown으로 변경하여 unsafe assignment 방지
   */
  private async requestApi<T>(
    method: 'get' | 'post' | 'patch' | 'delete',
    endpoint: string,
    params?: unknown,
    data?: unknown,
  ): Promise<T> {
    const targetPath = `${this.DATA_API_BASE}/${endpoint}`;
    
    try {
      this.logger.debug(`[Requesting ${method.toUpperCase()}] ${targetPath}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetPath,
          params,
          data,
        }),
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
          `[Data API Error] ${statusCode} - Failed: ${targetPath} / ${errorMessage}`,
        );
      }
      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }

  // --- 1. SDWT (ref_sdwt) ---
  async getSdwts(): Promise<RefSdwt[]> {
    return this.requestApi<RefSdwt[]>('get', 'sdwt');
  }

  async createSdwt(data: Prisma.RefSdwtCreateInput): Promise<RefSdwt> {
    return this.requestApi<RefSdwt>('post', 'sdwt', null, data);
  }

  async updateSdwt(id: string, data: Prisma.RefSdwtUpdateInput): Promise<RefSdwt> {
    return this.requestApi<RefSdwt>('patch', `sdwt/${id}`, null, data);
  }

  async deleteSdwt(id: string): Promise<RefSdwt> {
    return this.requestApi<RefSdwt>('delete', `sdwt/${id}`);
  }

  // --- 2. Agent Server Config (cfg_server) ---
  async getAgentServers(): Promise<CfgServer[]> {
    return this.requestApi<CfgServer[]>('get', 'server');
  }

  async createAgentServer(data: Prisma.CfgServerCreateInput): Promise<CfgServer> {
    return this.requestApi<CfgServer>('post', 'server', null, data);
  }

  async updateAgentServer(eqpid: string, data: Prisma.CfgServerUpdateInput): Promise<CfgServer> {
    return this.requestApi<CfgServer>('patch', `server/${eqpid}`, null, data);
  }

  async deleteAgentServer(eqpid: string): Promise<CfgServer> {
    return this.requestApi<CfgServer>('delete', `server/${eqpid}`);
  }
}

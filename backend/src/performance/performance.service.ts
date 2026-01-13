// backend/src/performance/performance.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

export interface PerformanceTrendResponse {
  eqpId: string;
  timestamp: string | Date;
  cpuUsage: number;
  memoryUsage: number;
  cpuTemp: number;
  gpuTemp: number;
  fanSpeed: number;
}

export interface ProcessMemoryResponse {
  timestamp: string | Date;
  processName: string;
  memoryUsageMB: number;
}

export interface ItmAgentTrendResponse {
  timestamp: string | Date;
  eqpId: string;
  memoryUsageMB: number;
}

@Injectable()
export class PerformanceService {
  private readonly DOMAIN = 'performance';

  constructor(private readonly dataApiService: DataApiService) {}

  async getHistory(
    startDate: string,
    endDate: string,
    eqpids: string,
    intervalSeconds: number = 300,
  ): Promise<PerformanceTrendResponse[]> {
    const params = {
      startDate,
      endDate,
      eqpids,
      intervalSeconds,
    };
    
    const result = await this.dataApiService.request<PerformanceTrendResponse[]>(
      this.DOMAIN,
      'get',
      'history',
      undefined,
      params,
    );
    return result || [];
  }

  async getProcessHistory(
    startDate: string,
    endDate: string,
    eqpId: string,
    intervalSeconds?: number,
  ): Promise<ProcessMemoryResponse[]> {
    const params = {
      startDate,
      endDate,
      eqpId,
      intervalSeconds,
    };

    const result = await this.dataApiService.request<ProcessMemoryResponse[]>(
      this.DOMAIN,
      'get',
      'process-history',
      undefined,
      params,
    );
    return result || [];
  }

  async getItmAgentTrend(
    site: string,
    sdwt: string,
    eqpid: string,
    startDate: string,
    endDate: string,
    intervalSeconds?: number,
  ): Promise<ItmAgentTrendResponse[]> {
    const params = {
      site,
      sdwt,
      eqpId: eqpid,
      startDate,
      endDate,
      intervalSeconds,
    };

    const result = await this.dataApiService.request<ItmAgentTrendResponse[]>(
      this.DOMAIN,
      'get',
      'itm-agent-trend',
      undefined,
      params,
    );
    return result || [];
  }
}

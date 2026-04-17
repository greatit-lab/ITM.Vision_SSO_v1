// backend/src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

export interface DashboardSummaryResponse {
  totalEqpCount: number;
  totalServers: number;
  onlineAgentCount: number;
  inactiveAgentCount: number;
  todayErrorCount: number;
  todayErrorTotalCount: number;
  newAlarmCount: number;
  latestAgentVersion: string;
  totalSdwts: number;
  serverHealth: number;
}

export interface AgentStatusResponse {
  eqpId: string;
  isOnline: boolean;
  lastContact: Date | string | null;
  pcName: string | null;
  cpuUsage: number;
  memoryUsage: number;
  appVersion: string;
  type: string;
  ipAddress: string;
  os: string;
  systemType: string;
  locale: string;
  timezone: string;
  todayAlarmCount: number;
  clockDrift: number | null;
}

export interface EasterEggResponse {
  id: number;
  userId: string;
  eggType: string;
  score: number;
  createdAt: string | Date;
}

export interface EasterEggRank {
  id: string;
  score: number;
}

@Injectable()
export class DashboardService {
  private readonly DOMAIN = 'dashboard';

  constructor(private readonly dataApiService: DataApiService) {}

  async getGlobalFleetData(): Promise<unknown[]> {
    const result = await this.dataApiService.request<unknown[]>(
      this.DOMAIN,
      'get',
      'global-fleet',
      undefined,
      undefined,
    );
    return result || [];
  }

  async getSummary(
    site?: string,
    sdwt?: string,
  ): Promise<DashboardSummaryResponse | null> {
    const params: Record<string, string> = {};
    if (site) params.site = site;
    if (sdwt) params.sdwt = sdwt;

    return this.dataApiService.request<DashboardSummaryResponse>(
      this.DOMAIN,
      'get',
      'summary',
      undefined,
      params,
    );
  }

  async getAgentStatus(
    site?: string,
    sdwt?: string,
  ): Promise<AgentStatusResponse[]> {
    const params: Record<string, string> = {};
    if (site) params.site = site;
    if (sdwt) params.sdwt = sdwt;

    const result = await this.dataApiService.request<AgentStatusResponse[]>(
      this.DOMAIN,
      'get',
      'agentstatus',
      undefined,
      params,
    );
    return result || [];
  }

  // [수정됨] 반환 타입에 '| null'을 추가하여 TS2322 에러 완벽 해결
  async saveEasterEgg(
    userId: string,
    eggType: string,
    score?: number,
  ): Promise<EasterEggResponse | null> {
    return this.dataApiService.request<EasterEggResponse>(
      this.DOMAIN,
      'post',
      'easter-egg',
      { userId, eggType, score: score || 0 },
      undefined,
    );
  }

  async getEasterEggRanking(eggType: string): Promise<EasterEggRank[]> {
    const result = await this.dataApiService.request<EasterEggRank[]>(
      this.DOMAIN,
      'get',
      'easter-egg/ranking',
      undefined,
      { eggType },
    );
    return result || [];
  }
}

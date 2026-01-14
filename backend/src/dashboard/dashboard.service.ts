// [전체 코드 교체]
// 프로젝트: ITM.Vision_SSO_v1
// 파일 경로: backend/src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// Interface 정의 (Frontend와 공유되는 구조)
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

@Injectable()
export class DashboardService {
  // Data API의 기본 경로 (Controller Prefix)
  private readonly DOMAIN = 'dashboard';

  constructor(private readonly dataApiService: DataApiService) {}

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
      undefined, // Body 없음
      params,    // Query Params
    );
  }

  async getAgentStatus(
    site?: string,
    sdwt?: string,
  ): Promise<AgentStatusResponse[]> {
    const params: Record<string, string> = {};
    if (site) params.site = site;
    if (sdwt) params.sdwt = sdwt;

    // Data API의 /dashboard/agentstatus 호출
    const result = await this.dataApiService.request<AgentStatusResponse[]>(
      this.DOMAIN,
      'get',
      'agentstatus',
      undefined,
      params,
    );
    return result || [];
  }
}

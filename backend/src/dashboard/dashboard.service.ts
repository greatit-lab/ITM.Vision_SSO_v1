// backend/src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [유지] Interface 정의
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

    // [주의] Data API Controller 경로는 'agentstatus' (하이픈 없음)
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

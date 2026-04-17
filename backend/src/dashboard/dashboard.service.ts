// backend/src/dashboard/dashboard.service.ts
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

// [신규] 이스터에그 저장 응답 타입 - 컨트롤러에서 참조할 수 있도록 반드시 export
export interface EasterEggResponse {
  id: number;
  userId: string;
  eggType: string;
  score: number;
  createdAt: string | Date;
}

// [신규] 이스터에그 랭킹 아이템 타입 - 컨트롤러에서 참조할 수 있도록 반드시 export
export interface EasterEggRank {
  id: string;
  score: number;
}

@Injectable()
export class DashboardService {
  // Data API의 기본 경로 (Controller Prefix)
  private readonly DOMAIN = 'dashboard';

  constructor(private readonly dataApiService: DataApiService) {}

  /**
   * Data API의 global-fleet 엔드포인트를 호출하여 데이터를 프론트엔드로 전달
   */
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

  /**
   * 대시보드 요약 정보 조회
   */
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

  /**
   * 에이전트 상태 정보 상세 조회
   */
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

  /**
   * [신규] 이스터에그 기록 저장 (매트릭스 발견 또는 디펜스 게임 점수)
   * Data-API(Prisma 서버)로 요청을 전달합니다.
   */
  async saveEasterEgg(
    userId: string,
    eggType: string,
    score?: number,
  ): Promise<EasterEggResponse> {
    return this.dataApiService.request<EasterEggResponse>(
      this.DOMAIN,
      'post',
      'easter-egg',
      { userId, eggType, score: score || 0 }, // Request Body
      undefined,
    );
  }

  /**
   * [신규] 이스터에그 타입별 글로벌 랭킹 조회
   * Data-API(Prisma 서버)로 요청을 전달합니다.
   */
  async getEasterEggRanking(eggType: string): Promise<EasterEggRank[]> {
    const result = await this.dataApiService.request<EasterEggRank[]>(
      this.DOMAIN,
      'get',
      'easter-egg/ranking',
      undefined,
      { eggType }, // Query Params
    );
    return result || [];
  }
}

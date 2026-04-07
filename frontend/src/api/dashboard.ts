// frontend/src/api/dashboard.ts
import http from "./http";

export interface DashboardSummaryDto {
  totalEqpCount: number;
  onlineAgentCount: number;
  todayErrorCount: number;
  todayErrorTotalCount: number; 
  newAlarmCount: number;
  latestAgentVersion: string;
}

export interface AgentStatusDto {
  eqpId: string;
  isOnline: boolean;
  lastContact: string | null;
  pcName: string;
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
  clockDrift?: number | null;
  useProxy?: string | null; 
  proxyIp?: string | null;  
}

export const dashboardApi = {
  // [신규 추가] 한 번의 호출로 Global Dashboard의 모든 데이터를 가져옵니다.
  getGlobalFleetData: async () => {
    const { data } = await http.get<any[]>("/dashboard/global-fleet");
    return data;
  },

  getSites: async () => {
    const { data } = await http.get<string[]>("/Filters/sites");
    return data;
  },
  getSdwts: async (site: string) => {
    const { data } = await http.get<string[]>(
      `/Filters/sdwts/${encodeURIComponent(site)}`
    );
    return data;
  },
  getSummary: async (site?: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await http.get<DashboardSummaryDto>("/dashboard/summary", {
      params,
    });
    return data;
  },
  getAgentStatus: async (site?: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await http.get<AgentStatusDto[]>(
      "/dashboard/agentstatus",
      { params }
    );
    return data;
  },
};

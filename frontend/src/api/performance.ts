// frontend/src/api/performance.ts
import http from "./http";

// Performance Trend용 데이터 DTO
export interface PerformanceDataPointDto {
  eqpId?: string;
  timestamp?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  cpuTemp?: number;
  gpuTemp?: number;
  fanSpeed?: number;
}

export interface ProcessMemoryDataDto {
  timestamp: string;
  processName: string;
  memoryUsageMB: number;
}

// ITM Agent 데이터 DTO
export interface ItmAgentDataDto {
  timestamp: string;
  eqpId: string;
  memoryUsageMB: number;
  agentVersion?: string; // [추가] Agent 버전 정보
}

export const performanceApi = {
  // 1. Performance Trend History
  getHistory: async (
    startDate: string,
    endDate: string,
    eqpids: string[],
    intervalSeconds = 300
  ) => {
    const params = {
      startDate,
      endDate,
      eqpids: eqpids.join(","),
      interval: intervalSeconds,
    };
    const { data } = await http.get<PerformanceDataPointDto[]>(
      "/performance/history",
      { params }
    );
    return data;
  },

  // 2. Process Memory History
  getProcessHistory: async (params: {
    startDate: string;
    endDate: string;
    eqpId: string;
    interval?: number;
  }) => {
    const { data } = await http.get<ProcessMemoryDataDto[]>(
      "/performance/process-history",
      { params }
    );
    return data;
  },

  // 3. ITM Agent Trend
  getItmAgentTrend: async (
    site: string,
    sdwt: string,
    eqpId: string,
    startDate: string,
    endDate: string,
    intervalSeconds?: number
  ) => {
    const params = {
      site,
      sdwt,
      eqpid: eqpId,
      startDate,
      endDate,
      interval: intervalSeconds,
    };
    const { data } = await http.get<ItmAgentDataDto[]>(
      "/performance/itm-agent-trend",
      { params }
    );
    return data;
  },
};

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
}

export const performanceApi = {
  // [수정] 대문자 'Performance' -> 소문자 'performance'
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
    // URL 수정: /performance/history
    const { data } = await http.get<PerformanceDataPointDto[]>(
      "/performance/history",
      { params }
    );
    return data;
  },

  // [수정] 경로 및 대소문자 수정
  getProcessHistory: async (
    startDate: string,
    endDate: string,
    eqpId: string,
    intervalSeconds?: number
  ) => {
    const params = { startDate, endDate, eqpId, interval: intervalSeconds };
    // URL 수정: /performance/process-history (백엔드와 일치)
    const { data } = await http.get<ProcessMemoryDataDto[]>(
      "/performance/process-history",
      { params }
    );
    return data;
  },

  // [수정] 대문자 'Performance' -> 소문자 'performance'
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
    // URL 수정: /performance/itm-agent-trend
    const { data } = await http.get<ItmAgentDataDto[]>(
      "/performance/itm-agent-trend",
      { params }
    );
    return data;
  },
};

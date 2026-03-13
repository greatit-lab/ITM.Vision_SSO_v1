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

// Process Memory 데이터 DTO
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
  memoryCommitMB?: number; // [추가] Memory Commit 필드
  agentVersion?: string;
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

  // 2. Process Memory History (객체 형태로 받는 구조로 완벽 복구 완료!)
  getProcessHistory: async (params: {
    startDate: string;
    endDate: string;
    eqpId: string;
    interval?: number;
  }) => {
    const { data } = await http.get<ProcessMemoryDataDto[]>(
      "/performance/process-history",
      { params } // 전달받은 params 객체를 그대로 axios에 넘깁니다.
    );
    return data;
  },

  // 3. ITM Agent Trend (나머지 인자들을 개별로 받는 구조 유지)
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

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
  // [유지] PerformanceTrendView에서는 개별 인자로 호출하므로 유지
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

  // [수정] ProcessMemoryView에서 객체 인자 방식으로 호출하므로 인터페이스 수정
  getProcessHistory: async (params: {
    startDate: string;
    endDate: string;
    eqpId: string;
    interval?: number;
  }) => {
    // params 객체 자체가 쿼리 파라미터 구조와 일치하므로 그대로 전달
    const { data } = await http.get<ProcessMemoryDataDto[]>(
      "/performance/process-history",
      { params }
    );
    return data;
  },

  // [유지] ItmAgentMemoryView용 (기존 유지)
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

// frontend/src/api/performance.ts
// frontend/src/api/performance.ts
import http from "./http";

// [추가] Performance Trend용 데이터 DTO (Export 필수)
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
  // [기존] 장비 성능 히스토리 조회
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
    // [수정] 반환 타입 명시 <PerformanceDataPointDto[]>
    const { data } = await http.get<PerformanceDataPointDto[]>("/Performance/history", { params });
    return data;
  },

  // [기존] 프로세스별 메모리 히스토리 조회
  getProcessHistory: async (
    startDate: string,
    endDate: string,
    eqpId: string,
    intervalSeconds?: number
  ) => {
    const params = { startDate, endDate, eqpId, interval: intervalSeconds };
    const { data } = await http.get<ProcessMemoryDataDto[]>(
      "/Performance/process/history",
      { params }
    );
    return data;
  },

  // [추가] ITM Agent Trend API 호출
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
      interval: intervalSeconds 
    };
    const { data } = await http.get<ItmAgentDataDto[]>(
      "/Performance/itm-agent-trend",
      { params }
    );
    return data;
  },
};

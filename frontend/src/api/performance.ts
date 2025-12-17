// frontend/src/api/performance.ts
import http from "./http"; // [수정] axios 직접 생성 대신 공통 http 모듈 사용

// DTO 인터페이스 정의 (기존 유지)
export interface PerformanceDataPointDto {
  eqpId: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  cpuTemp: number;
  gpuTemp: number;
  fanSpeed: number;
}

export interface ProcessMemoryDataDto {
  timestamp: string;
  processName: string;
  memoryUsageMB: number;
}

// API 호출 객체
export const performanceApi = {
  // Performance Trend 차트 데이터
  getHistory: async (
    startDate: string,
    endDate: string,
    eqpids: string,
    intervalSeconds: number
  ) => {
    const params = { startDate, endDate, eqpids, intervalSeconds };
    // [수정] apiClient -> http 로 변경
    const { data } = await http.get<PerformanceDataPointDto[]>(
      "/PerformanceAnalytics/history",
      { params }
    );
    return data;
  },

  // Process Memory 데이터
  getProcessHistory: async (
    startDate: string,
    endDate: string,
    eqpId: string,
    intervalSeconds?: number
  ) => {
    const params = { startDate, endDate, eqpid: eqpId, intervalSeconds };
    // [수정] apiClient -> http 로 변경
    const { data } = await http.get<ProcessMemoryDataDto[]>(
      "/PerformanceAnalytics/process-history",
      { params }
    );
    return data;
  },
};

// frontend/src/api/performance.ts
import httpData from './http-data';

export interface PerformanceData {
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
  processName: string; // 혹은 eqpId (ITM Agent Trend의 경우)
  memoryUsageMB: number;
}

// 1. 장비 성능 이력 조회
export const getPerformanceHistory = async (params: {
  startDate: string;
  endDate: string;
  eqpids: string;
}): Promise<PerformanceData[]> => {
  const response = await httpData.get<PerformanceData[]>('/performance/history', { params });
  return response.data;
};

// 2. 특정 장비의 프로세스별 메모리 이력 조회
export const getProcessHistory = async (params: {
  startDate: string;
  endDate: string;
  eqpId: string;
  interval?: number;
}): Promise<ProcessMemoryDataDto[]> => {
  const response = await httpData.get<ProcessMemoryDataDto[]>('/performance/process-history', { params });
  return response.data;
};

// 3. ITM Agent 프로세스 메모리 트렌드 조회 (전체 장비 비교)
export const getItmAgentTrend = async (params: {
  site: string;
  sdwt: string;
  startDate: string;
  endDate: string;
}): Promise<ProcessMemoryDataDto[]> => {
  const response = await httpData.get<ProcessMemoryDataDto[]>('/performance/itm-agent-trend', { params });
  return response.data;
};

// [Export] 객체 형태로 내보내기 (View에서 import { performanceApi } 로 사용)
export const performanceApi = {
  getPerformanceHistory,
  getProcessHistory,
  getItmAgentTrend,
};

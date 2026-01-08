// frontend/src/api/performance.ts
import httpData from './http-data'; // [변경] 8081 포트 사용

export interface PerformanceData {
  eqpId: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  cpuTemp: number;
  gpuTemp: number;
  fanSpeed: number;
}

export interface ProcessMemoryData {
  timestamp: string;
  processName: string; // 혹은 eqpId (ITM Agent Trend의 경우)
  memoryUsageMB: number;
}

// 1. 장비 성능 이력 조회
export const getPerformanceHistory = (params: {
  startDate: string;
  endDate: string;
  eqpids: string;
}) => httpData.get<PerformanceData[]>('/performance/history', { params });

// 2. 특정 장비의 프로세스별 메모리 이력 조회
export const getProcessHistory = (params: {
  startDate: string;
  endDate: string;
  eqpId: string;
}) => httpData.get<ProcessMemoryData[]>('/performance/process-history', { params });

// 3. ITM Agent 프로세스 메모리 트렌드 조회 (전체 장비 비교)
export const getItmAgentTrend = (params: {
  site: string;
  sdwt: string;
  startDate: string;
  endDate: string;
}) => httpData.get<ProcessMemoryData[]>('/performance/itm-agent-trend', { params });

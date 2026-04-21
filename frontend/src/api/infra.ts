// frontend/src/api/infra.ts
import http from "./http";

// ==========================================
// [신규 추가] 서버 모니터링 관련 데이터 타입 및 API
// ==========================================

export interface ServerMetrics {
  id: string;
  name: string;
  ip: string;
  status: "healthy" | "warning" | "critical";
  cpu: number;
  memory: number;
  memoryDetails: string;
  disk: number;
  diskDetails: string;
}

export interface TrendData {
  dates: string[];
  cpu: number[];
  memory: number[];
  disk: number[];
}

// 1. 서버 리소스 모니터링 데이터 호출 API (상단 카드 영역)
export const getServerMetrics = () =>
  http.get<ServerMetrics[]>("http://[API Server IP]:8081/api/admin/server-metrics");

// 2. 30일치 트렌드 데이터 조회 (하단 차트 영역)
export const getServerTrend = (serverId: string, days: number = 30) =>
  http.get<TrendData>(`http://[API Server IP]:8081/api/admin/server-trend/${serverId}?days=${days}`);


// ==========================================
// [기존 코드 유지] 기존 인프라 관리 API (8080 포트 유지)
// ==========================================

// View에서 호출하는 장비 목록 API (기존 /equipment API 활용)
export const getInfraEquipment = () => http.get("/equipment");

// 1. SDWT (ref_sdwt)
export const getInfraSdwt = () => http.get("/infra/sdwt");
export const createInfraSdwt = (data: any) => http.post("/infra/sdwt", data);
export const updateInfraSdwt = (id: string, data: any) =>
  http.put(`/infra/sdwt/${id}`, data);
export const deleteInfraSdwt = (id: string) => http.delete(`/infra/sdwt/${id}`);

// 3. Agent Server Config (cfg_server)
export const getAgentServers = () => http.get("/infra/agent-server");
export const createAgentServer = (data: any) =>
  http.post("/infra/agent-server", data);
export const updateAgentServer = (id: string, data: any) =>
  http.put(`/infra/agent-server/${id}`, data);
export const deleteAgentServer = (id: string) =>
  http.delete(`/infra/agent-server/${id}`);

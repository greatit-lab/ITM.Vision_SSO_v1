// frontend/src/api/admin.ts
import http from './http';

// ==========================================
// [Interfaces] 데이터 타입 정의
// ==========================================

export interface NewServerConfig {
  id: number;
  newDbHost: string;
  newDbUser?: string;
  newDbPw?: string;
  newDbPort: number;
  newFtpHost: string;
  newFtpUser?: string;
  newFtpPw?: string;
  newFtpPort: number;
  description?: string;
}

// [수정] Site, SDWT 필드 추가 (필터링 및 테이블 표시에 사용)
export interface AgentServerConfig {
  eqpid: string;
  agentDbHost?: string;
  agentFtpHost?: string;
  updateFlag: string; // 'yes' | 'no'
  update?: string;
  site?: string; // 추가됨
  sdwt?: string; // 추가됨
}

// ==========================================
// [User Management] 시스템 사용자 관리
// ==========================================
export const getUsers = () => http.get('/admin/users');

// 관리자(Manager) 목록 조회
export const getAdmins = () => http.get('/admin/admins');

// 관리자 추가
export const addAdmin = (data: {
  loginId: string;
  role: string;
  assignedBy?: string;
}) => http.post('/admin/admins', data);

// 관리자 삭제
export const deleteAdmin = (loginId: string) => http.delete(`/admin/admins/${loginId}`);


// ==========================================
// [Access Codes] 접근 제어 (Whitelist)
// ==========================================
// 접근 허용 목록 조회
export const getAccessCodes = () => http.get('/admin/access-codes');

// 접근 허용 코드 생성
export const createAccessCode = (data: {
  compid: string;
  deptid: string;
  description?: string;
  isActive?: string;
}) => http.post('/admin/access-codes', data);

// 접근 허용 코드 수정
export const updateAccessCode = (compid: string, data: {
  deptid: string;
  description?: string;
  isActive?: string;
}) => http.put(`/admin/access-codes/${compid}`, data);

// 접근 허용 코드 삭제
export const deleteAccessCode = (compid: string) => http.delete(`/admin/access-codes/${compid}`);


// ==========================================
// [Guest Management] 게스트 관리
// ==========================================
export const getGuests = () => http.get('/admin/guests');

export const addGuest = (data: {
  loginId: string;
  deptCode?: string;
  deptName?: string;
  reason?: string;
  validUntil: string | Date;
}) => http.post('/admin/guests', data);

export const deleteGuest = (loginId: string) => http.delete(`/admin/guests/${loginId}`);

// ==========================================
// [Access Request] 접근 신청 관리
// ==========================================
export const getGuestRequests = () => http.get('/admin/requests');

export const approveGuestRequest = (data: { 
  reqId: number; 
  validUntil: string | Date; 
  approverId: string 
}) => http.post('/admin/requests/approve', data);

export const rejectGuestRequest = (data: { 
  reqId: number; 
  approverId: string 
}) => http.post('/admin/requests/reject', data);

// ==========================================
// [Infra Management] 1. 에러 심각도 (Error Severity)
// ==========================================
export const getSeverities = () => http.get('/admin/severity');

export const addSeverity = (data: {
  errorId: string;
  severity: string;
  description?: string;
}) => http.post('/admin/severity', data);

export const updateSeverity = (errorId: string, data: {
  severity: string;
  description?: string;
}) => http.put(`/admin/severity/${errorId}`, data);

export const deleteSeverity = (errorId: string) => http.delete(`/admin/severity/${errorId}`);

// ==========================================
// [Infra Management] 2. 분석 지표 (Analysis Metrics)
// ==========================================
export const getMetrics = () => http.get('/admin/metrics');

export const addMetric = (data: {
  metricName: string;
  isExcluded: boolean | string;
}) => http.post('/admin/metrics', data);

export const updateMetric = (name: string, data: {
  metricName: string;
  isExcluded: boolean | string;
}) => http.put(`/admin/metrics/${name}`, data);

export const deleteMetric = (name: string) => http.delete(`/admin/metrics/${name}`);

// ==========================================
// [System Config] Server Configuration
// ==========================================

// 1. 공통(신규) 서버 설정 조회
export async function getNewServerConfig(): Promise<NewServerConfig> {
  const response = await http.get('/admin/new-server');
  return response.data;
}

// 2. 공통(신규) 서버 설정 수정
export async function updateNewServerConfig(data: Partial<NewServerConfig>): Promise<NewServerConfig> {
  const response = await http.put('/admin/new-server', data);
  return response.data;
}

// 3. 장비별 에이전트 서버 목록 조회
export async function getAgentServers(): Promise<AgentServerConfig[]> {
  const response = await http.get('/admin/servers');
  return response.data;
}

// 4. 장비별 에이전트 서버 추가
export async function createAgentServer(data: AgentServerConfig): Promise<AgentServerConfig> {
  const response = await http.post('/admin/servers', data);
  return response.data;
}

// 5. 장비별 에이전트 서버 수정
export async function updateAgentServer(eqpId: string, data: Partial<AgentServerConfig>): Promise<AgentServerConfig> {
  const response = await http.put(`/admin/servers/${eqpId}`, data);
  return response.data;
}

// 6. 장비별 에이전트 서버 삭제
export async function deleteAgentServer(eqpId: string): Promise<void> {
  await http.delete(`/admin/servers/${eqpId}`);
}

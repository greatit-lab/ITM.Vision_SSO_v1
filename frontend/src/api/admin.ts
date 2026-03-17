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

export interface AgentServerConfig {
  eqpid: string;
  agentDbHost?: string;
  agentFtpHost?: string;
  updateFlag: string; // 'yes' | 'no'
  update?: string;
  site?: string;
  sdwt?: string;
}

// ==========================================
// [User Management] 시스템 사용자 관리
// ==========================================
export const getUsers = () => http.get('/admin/users');

export const getAdmins = () => http.get('/admin/admins');

export const addAdmin = (data: { loginId: string; role: string; assignedBy?: string; }) => http.post('/admin/admins', data);

export const deleteAdmin = (loginId: string) => http.delete(`/admin/admins/${loginId}`);

// ==========================================
// [Access Codes] 접근 제어 (Whitelist)
// ==========================================
// [수정됨] API 경로 및 파라미터 기준(deptid) 통일
export const getAccessCodes = () => http.get('/admin/access-codes');

export const createAccessCode = (data: { compid?: string; deptid: string; description?: string; isActive?: string; }) => http.post('/admin/access-codes', data);

export const updateAccessCode = (deptid: string, data: { compid?: string; description?: string; isActive?: string; }) => http.put(`/admin/access-codes/${deptid}`, data);

export const deleteAccessCode = (deptid: string) => http.delete(`/admin/access-codes/${deptid}`);

// ==========================================
// [Guest Management] 게스트 관리
// ==========================================
export const getGuests = () => http.get('/admin/guests');

export const addGuest = (data: { loginId: string; deptCode?: string; deptName?: string; reason?: string; validUntil: string | Date; }) => http.post('/admin/guests', data);

export const deleteGuest = (loginId: string) => http.delete(`/admin/guests/${loginId}`);

// ==========================================
// [Access Request] 접근 신청 관리
// ==========================================
export const getGuestRequests = () => http.get('/admin/requests');

export const approveGuestRequest = (data: { reqId: number; validUntil: string | Date; approverId: string }) => http.post('/admin/requests/approve', data);

export const rejectGuestRequest = (data: { reqId: number; approverId: string }) => http.post('/admin/requests/reject', data);

// ==========================================
// [Infra Management] 1. 에러 심각도 (Error Severity)
// ==========================================
export const getSeverities = () => http.get('/admin/severity');

export const addSeverity = (data: { errorId: string; severity: string; description?: string; }) => http.post('/admin/severity', data);

export const updateSeverity = (errorId: string, data: { severity: string; description?: string; }) => http.put(`/admin/severity/${errorId}`, data);

export const deleteSeverity = (errorId: string) => http.delete(`/admin/severity/${errorId}`);

// ==========================================
// [Infra Management] 2. 분석 지표 (Analysis Metrics)
// ==========================================
export const getMetrics = () => http.get('/admin/metrics');

export const addMetric = (data: { metricName: string; isExcluded: boolean | string; }) => http.post('/admin/metrics', data);

export const updateMetric = (name: string, data: { metricName: string; isExcluded: boolean | string; }) => http.put(`/admin/metrics/${name}`, data);

export const deleteMetric = (name: string) => http.delete(`/admin/metrics/${name}`);

// ==========================================
// [System Config] Server Configuration
// ==========================================
export async function getNewServerConfig(): Promise<NewServerConfig> {
  const response = await http.get('/admin/new-server');
  return response.data;
}

export async function updateNewServerConfig(data: Partial<NewServerConfig>): Promise<NewServerConfig> {
  const response = await http.put('/admin/new-server', data);
  return response.data;
}

export async function getAgentServers(): Promise<AgentServerConfig[]> {
  const response = await http.get('/admin/servers');
  return response.data;
}

export async function createAgentServer(data: AgentServerConfig): Promise<AgentServerConfig> {
  const response = await http.post('/admin/servers', data);
  return response.data;
}

export async function updateAgentServer(eqpId: string, data: Partial<AgentServerConfig>): Promise<AgentServerConfig> {
  const response = await http.put(`/admin/servers/${eqpId}`, data);
  return response.data;
}

export async function deleteAgentServer(eqpId: string): Promise<void> {
  await http.delete(`/admin/servers/${eqpId}`);
}

// ==========================================
// [Usage Analytics] 사용량 분석 및 접속 로그
// ==========================================
export const adminApi = {
  // 1. 접속 로그 기록 (Vue Router에서 자동 호출)
  logAccess: async (data: { loginId: string; menuName: string; accessUrl: string }) => {
    
    // sessionStorage를 이용해 외부 진입(세션 생성) 여부를 추적합니다.
    const isFirstEntry = !sessionStorage.getItem('ivision_session_entry');

    if (isFirstEntry) {
      sessionStorage.setItem('ivision_session_entry', 'true');
      
      // 브라우저 탭을 열고 처음 진입할 때 'APP_ENTRY'라는 특수 이벤트로 방문(Visit)을 카운트합니다.
      await http.post("/admin/access-log", { ...data, menuName: 'APP_ENTRY' });

      const targetName = data.menuName.toLowerCase();
      // 최초 진입 시 보여지는 Overview 등은 조회수(Page View) 통계 오염을 막기 위해 여기서 종료합니다.
      if (targetName === 'overview' || targetName === 'home' || targetName === '-') {
        return; 
      }
    }

    // 기존 로그 기록 로직 (일반 페이지 이동 조회수)
    await http.post("/admin/access-log", data);
  },

  // 2. 사용량 통계 조회 (Usage Analytics 뷰에서 호출)
  getUsageAnalytics: async (startDate: string, endDate: string) => {
    const { data } = await http.get("/admin/usage-analytics", {
      params: { startDate, endDate },
    });
    return data;
  },
};

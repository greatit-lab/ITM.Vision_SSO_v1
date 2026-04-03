// frontend/src/api/admin.ts
import http from "./http";

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
  updateFlag: string; 
  update?: string;
  site?: string;
  sdwt?: string;
}

export const getUsers = () => http.get("/admin/users");

export const getAdmins = () => http.get("/admin/admins");
export const addAdmin = (data: { loginId: string; role: string; assignedBy?: string; }) => http.post("/admin/admins", data);
export const deleteAdmin = (loginId: string) => http.delete(`/admin/admins/${loginId}`);

export const getAccessCodes = () => http.get("/admin/access-codes");
export const createAccessCode = (data: { compid?: string; deptid: string; description?: string; isActive?: string; }) => http.post("/admin/access-codes", data);
export const updateAccessCode = ( deptid: string, data: { compid?: string; description?: string; isActive?: string }, ) => http.put(`/admin/access-codes/${deptid}`, data);
export const deleteAccessCode = (deptid: string) => http.delete(`/admin/access-codes/${deptid}`);

// 🌟 [추가됨] 예외 접근 사용자 API
export const getExceptionUsers = () => http.get("/admin/exceptions");
export const addExceptionUser = (data: { loginId: string; deptCode?: string; deptName?: string; registeredBy: string }) => http.post("/admin/exceptions", data);
export const updateExceptionUserStatus = (loginId: string, isActive: string) => http.put(`/admin/exceptions/${loginId}/status`, { isActive });
export const deleteExceptionUser = (loginId: string) => http.delete(`/admin/exceptions/${loginId}`);

export const getGuests = () => http.get("/admin/guests");
export const addGuest = (data: { loginId: string; deptCode?: string; deptName?: string; reason?: string; validUntil: string | Date; }) => http.post("/admin/guests", data);
export const deleteGuest = (loginId: string) => http.delete(`/admin/guests/${loginId}`);

export const getGuestRequests = () => http.get("/admin/requests");
export const approveGuestRequest = (data: { reqId: number; validUntil: string | Date; approverId: string; }) => http.post("/admin/requests/approve", data);
export const rejectGuestRequest = (data: { reqId: number; approverId: string; }) => http.post("/admin/requests/reject", data);

export const getSeverities = () => http.get("/admin/severity");
export const addSeverity = (data: { errorId: string; severity: string; description?: string; }) => http.post("/admin/severity", data);
export const updateSeverity = ( errorId: string, data: { severity: string; description?: string }, ) => http.put(`/admin/severity/${errorId}`, data);
export const deleteSeverity = (errorId: string) => http.delete(`/admin/severity/${errorId}`);

export const getMetrics = () => http.get("/admin/metrics");
export const addMetric = (data: { metricName: string; isExcluded: boolean | string; }) => http.post("/admin/metrics", data);
export const updateMetric = ( name: string, data: { metricName: string; isExcluded: boolean | string }, ) => http.put(`/admin/metrics/${name}`, data);
export const deleteMetric = (name: string) => http.delete(`/admin/metrics/${name}`);

export async function getNewServerConfig(): Promise<NewServerConfig> {
  const response = await http.get("/admin/new-server");
  return response.data;
}
export async function updateNewServerConfig( data: Partial<NewServerConfig>, ): Promise<NewServerConfig> {
  const response = await http.put("/admin/new-server", data);
  return response.data;
}
export async function getAgentServers(): Promise<AgentServerConfig[]> {
  const response = await http.get("/admin/servers");
  return response.data;
}
export async function createAgentServer( data: AgentServerConfig, ): Promise<AgentServerConfig> {
  const response = await http.post("/admin/servers", data);
  return response.data;
}
export async function updateAgentServer( eqpId: string, data: Partial<AgentServerConfig>, ): Promise<AgentServerConfig> {
  const response = await http.put(`/admin/servers/${eqpId}`, data);
  return response.data;
}
export async function deleteAgentServer(eqpId: string): Promise<void> {
  await http.delete(`/admin/servers/${eqpId}`);
}

export const adminApi = {
  logAccess: async (data: { loginId: string; menuName: string; accessUrl: string; }) => {
    const isFirstEntry = !sessionStorage.getItem("ivision_session_entry");
    if (isFirstEntry) {
      sessionStorage.setItem("ivision_session_entry", "true");
      await http.post("/admin/access-log", { ...data, menuName: "APP_ENTRY" });
      const targetName = data.menuName.toLowerCase();
      if ( targetName === "overview" || targetName === "home" || targetName === "-" ) { return; }
    }
    await http.post("/admin/access-log", data);
  },
  getUsageAnalytics: async (startDate: string, endDate: string) => {
    const { data } = await http.get("/admin/usage-analytics", { params: { startDate, endDate }, });
    return data;
  },
  getStorageUsage: async ( startDate: string, endDate: string, interval: string, ) => {
    const { data } = await http.get("/admin/storage-usage", { params: { startDate, endDate, interval }, });
    return data;
  },
};

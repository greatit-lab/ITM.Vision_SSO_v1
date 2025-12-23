// frontend/src/api/admin.ts
import http from './http';

// ==========================================
// [User Management] 시스템 사용자 관리
// ==========================================
export const getUsers = () => http.get('/admin/users');

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
// [System Config] 1. 에러 심각도 (Error Severity)
// ==========================================
export const getSeverities = () => http.get('/admin/severity');

export const addSeverity = (data: {
  errorId: string;
  severity: string;
  description?: string;
}) => http.post('/admin/severity', data);

export const updateSeverity = (id: number, data: {
  errorId: string;
  severity: string;
  description?: string;
}) => http.put(`/admin/severity/${id}`, data);

export const deleteSeverity = (id: number) => http.delete(`/admin/severity/${id}`);

// ==========================================
// [System Config] 2. 분석 지표 (Analysis Metrics)
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

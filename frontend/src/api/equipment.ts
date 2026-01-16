// frontend/src/api/equipment.ts
import http from './http';

// [수정] eqpid -> eqpId (Backend Data API의 CamelCase 응답과 일치시킴)
export interface Equipment {
  eqpId: string;
  sdwt?: string;
  [key: string]: any;
}

// 2. 장비 상세 정보 인터페이스 (EquipmentDto 매핑)
export interface EquipmentDto {
  eqpId: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  lastContact: string | null;
  os: string;
  systemType: string;
  timezone: string;
  macAddress: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  type: string;
  locale: string;
  systemModel: string;
  serialNum: string;
  application: string;
  version: string;
  dbVersion: string;
}

/**
 * 1. 인프라 관리용 목록 조회 (단순 RefEquipment 테이블 조회)
 * GET /api/equipment
 */
export async function getInfraList(): Promise<Equipment[]> {
  const response = await http.get('/equipment');
  return response.data;
}

/**
 * 2. 장비 상세 조회 (Explorer용 - AgentInfo 등 Join된 데이터)
 * GET /api/equipment/details
 */
export async function getEquipmentDetails(params: {
  site?: string;
  sdwt?: string;
  eqpId?: string;
}): Promise<EquipmentDto[]> {
  const response = await http.get('/equipment/details', { params });
  return response.data;
}

/**
 * 3. 장비 ID 목록 조회
 * GET /api/equipment/ids
 */
export async function getEqpIds(params: {
  site?: string;
  sdwt?: string;
  type?: string;
}): Promise<string[]> {
  const response = await http.get('/equipment/ids', { params });
  return response.data;
}

/**
 * 4. 단일 장비 조회 (PK 기준)
 * GET /api/equipment/:id
 */
export async function getEquipment(eqpId: string): Promise<Equipment> {
  const response = await http.get(`/equipment/${eqpId}`);
  return response.data;
}

/**
 * 5. 장비 추가
 * POST /api/equipment
 */
export async function createEquipment(data: Partial<Equipment>): Promise<Equipment> {
  const response = await http.post('/equipment', data);
  return response.data;
}

/**
 * 6. 장비 수정
 * PATCH /api/equipment/:id
 */
export async function updateEquipment(eqpId: string, data: Partial<Equipment>): Promise<Equipment> {
  const response = await http.patch(`/equipment/${eqpId}`, data);
  return response.data;
}

/**
 * 7. 장비 삭제
 * DELETE /api/equipment/:id
 */
export async function deleteEquipment(eqpId: string): Promise<void> {
  await http.delete(`/equipment/${eqpId}`);
}

export const equipmentApi = {
  getInfraList,
  getEquipmentDetails,
  getEqpIds,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};

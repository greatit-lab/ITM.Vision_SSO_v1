// frontend/src/api/equipment.ts
import http from './http';

// 1. 인프라 관리용 장비 인터페이스 (RefEquipment 매핑)
export interface Equipment {
  eqpid: string;
  sdwt?: string;
  // 필요한 경우 RefEquipment 테이블의 추가 컬럼 정의 (예: site, line 등)
  [key: string]: any;
}

// 2. 장비 상세 정보 인터페이스 (EquipmentDto 매핑)
export interface EquipmentDto {
  eqpId: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  lastContact: string | null; // JSON 변환 시 Date는 string으로 옴
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

// [수정] View에서 import { equipmentApi } 로 사용할 수 있도록 객체 export 추가
export const equipmentApi = {
  getInfraList,
  getEquipmentDetails,
  getEqpIds,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};

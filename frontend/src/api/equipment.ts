// frontend/src/api/equipment.ts
import http from "./http"; // axios 인스턴스 import

export interface EquipmentSpecDto {
  eqpId: string;
  type: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  macAddress: string;
  os: string;
  systemType: string;
  locale: string;
  timezone: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  lastContact: string | null;
  systemModel: string;
  serialNum: string;
  application: string;
  version: string;
  dbVersion: string;
}

// [수정] EqpIdType 타입 정의 추가
export type EqpIdType = 'wafer' | 'performance' | 'process' | 'error' | 'prealign' | 'agent' | 'all';

export const equipmentApi = {
  // [수정] 장비 ID 목록 조회 (type 파라미터 추가)
  // type이 없으면 기존처럼 동작하지 않고, Backend에서 처리
  getEqpIds: async (site?: string, sdwt?: string, type: EqpIdType = 'all') => {
    const params = { site, sdwt, type };
    // [수정] Backend Controller 경로 변경 (/Filters/eqpids)
    // 기존 /Equipment/eqpids는 전체 조회를 담당했으나, 필터링 기능이 강화된 /Filters/eqpids로 통합 권장
    const { data } = await http.get<string[]>("/Filters/eqpids", {
      params,
    });
    return data;
  },

  // 장비 상세 정보 조회 (기존 유지)
  getDetails: async (site?: string, sdwt?: string, eqpId?: string) => {
    const params = { site, sdwt, eqpId };
    const { data } = await http.get<EquipmentSpecDto[]>(
      "/Equipment/details",
      { params }
    );
    return data;
  },
};

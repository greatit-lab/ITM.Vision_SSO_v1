// frontend/src/api/lamp.ts
import httpData from './http-data'; // [변경] 8081 포트 사용

export interface LampLife {
  eqpId: string;
  lampId: string;
  lampNo: number | string;
  ageHour: number;
  lifespanHour: number;
  lastChanged: string | null;
  servTs: string;
}

// 램프 수명 현황 조회
export const getLampLifeStatus = (params: { site: string; sdwt?: string }) => 
  httpData.get<LampLife[]>('/lamplife', { params });

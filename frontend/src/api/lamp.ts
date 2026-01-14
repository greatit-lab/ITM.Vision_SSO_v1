// frontend/src/api/lamp.ts
import httpData from './http-data'; // 프로젝트 설정에 따라 import 경로가 다를 수 있음 (./http 또는 @/api/http)

export interface LampLife {
  eqpId: string;
  lampId: string;
  lampNo: number | string;
  ageHour: number;
  lifespanHour: number;
  lastChanged: string | null;
  servTs: string;
}

// 1. 램프 수명 현황 조회
export const getLampLifeStatus = (params: { site: string; sdwt?: string }) =>
  httpData.get<LampLife[]>('/lamplife', { params });

// 2. [추가] 램프 교체 이력 등록
// LampLifeView.vue에서 이 함수를 import하여 사용 중이므로 반드시 export 해야 함
export const registerReplacement = (eqpId: string, date?: string) => {
  return httpData.post('/lamplife/replacement', { eqpId, date });
};

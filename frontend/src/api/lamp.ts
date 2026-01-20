// frontend/src/api/lamp.ts
import http from './http'; // [수정] http-data(직접접속) -> http(백엔드 경유)

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
// Backend Controller의 @Controller('lamplife')로 요청 전달
export const getLampLifeStatus = (params: { site: string; sdwt?: string }) =>
  http.get<LampLife[]>('/lamplife', { params });

// 2. 램프 교체 이력 등록
export const registerReplacement = (eqpId: string, date?: string) => {
  return http.post('/lamplife/replacement', { eqpId, date });
};

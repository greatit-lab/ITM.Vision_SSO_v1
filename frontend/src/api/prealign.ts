// frontend/src/api/prealign.ts
import http from './http'; // [Backend 3000 포트 경유]

export interface PreAlignData {
  timestamp: string;
  eqpId: string; // [수정] View에서 요구하는 필수 속성 추가
  xmm: number;
  ymm: number;
  notch: number;
}

// PreAlign 데이터 조회
export const getPreAlignData = (params: {
  site: string;
  sdwt: string;
  eqpId: string;
  startDate: string;
  endDate: string;
}) => http.get<PreAlignData[]>('/prealign/trend', { params });

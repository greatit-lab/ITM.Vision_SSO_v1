// frontend/src/api/prealign.ts
import http from './http'; // [수정] Backend(3000) 경유

export interface PreAlignData {
  timestamp: string;
  eqpId: string;
  xmm: number;
  ymm: number;
  notch: number;
}

// PreAlign 데이터 조회
// [수정] Backend Controller와 파라미터 규격 일치 (site, sdwt 추가)
export const getPreAlignData = (params: {
  site: string;
  sdwt: string;
  eqpId: string;
  startDate: string;
  endDate: string;
}) => http.get<PreAlignData[]>('/prealign/trend', { params });

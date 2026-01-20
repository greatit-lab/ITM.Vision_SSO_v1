// frontend/src/api/prealign.ts
import http from './http'; // [핵심 변경] http-data(8081) -> http(3000)

export interface PreAlignData {
  timestamp: string;
  xmm: number;
  ymm: number;
  notch: number;
}

// PreAlign 데이터 조회
// [수정] Backend Controller가 요구하는 site, sdwt 파라미터가 포함되어야 합니다.
export const getPreAlignData = (params: {
  site: string;
  sdwt: string;
  eqpId: string;
  startDate: string;
  endDate: string;
}) => http.get<PreAlignData[]>('/prealign/trend', { params });

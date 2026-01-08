// frontend/src/api/prealign.ts
import httpData from './http-data'; // [변경] 8081 포트 사용

export interface PreAlignData {
  timestamp: string;
  xmm: number;
  ymm: number;
  notch: number;
}

// PreAlign 데이터 조회
export const getPreAlignData = (params: {
  eqpId: string;
  startDate: string;
  endDate: string;
}) => httpData.get<PreAlignData[]>('/prealign', { params });

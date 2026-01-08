// frontend/src/api/error.ts
import httpData from './http-data'; // [변경] 8081 포트 사용

export interface ErrorSummary {
  totalErrorCount: number;
  errorEqpCount: number;
  topErrorId: string;
  topErrorCount: number;
  topErrorLabel: string;
  errorCountByEqp: { label: string; value: number }[];
}

export interface ErrorTrendItem {
  date: string;
  count: number;
}

export interface ErrorLogItem {
  timeStamp: string;
  eqpId: string;
  errorId: string;
  errorLabel: string;
  errorDesc: string;
  extraMessage1?: string;
  extraMessage2?: string;
}

// 1. 에러 요약 정보 조회
export const getErrorSummary = (params: any) => 
  httpData.get<ErrorSummary>('/error/summary', { params });

// 2. 일별 에러 발생 추이 조회
export const getErrorTrend = (params: any) => 
  httpData.get<ErrorTrendItem[]>('/error/trend', { params });

// 3. 에러 로그 목록 조회 (페이징)
export const getErrorLogs = (params: any) => 
  httpData.get<{ items: ErrorLogItem[]; totalItems: number }>('/error/logs', { params });

// frontend/src/api/error.ts
import http from './http';

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
  timeStamp: string; // [수정] Data-API 반환값에 맞춰 'timeStamp'로 변경
  eqpId: string;
  errorId: string;
  errorLabel: string;
  errorDesc: string;
  extraMessage1?: string;
  extraMessage2?: string;
}

// 1. 에러 요약 정보 조회
export const getErrorSummary = (params: any) => 
  http.get<ErrorSummary>('/error/summary', { params });

// 2. 일별 에러 발생 추이 조회
export const getErrorTrend = (params: any) => 
  http.get<ErrorTrendItem[]>('/error/trend', { params });

// 3. 에러 로그 목록 조회
export const getErrorLogs = (params: any) => 
  http.get<{ items: ErrorLogItem[]; totalItems: number }>('/error/list', { params });

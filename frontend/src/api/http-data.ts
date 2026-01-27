// frontend/src/api/http-data.ts
import axios from 'axios';

const getBaseUrl = () => {
  // 1. 환경 변수 우선
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // 2. 기본값: Backend Proxy 경로 사용
  // [수정] 기존의 'window.location ... :8081' 로직 삭제
  // HTTPS 환경에서 HTTP(8081) 직접 호출 시 발생하는 Mixed Content 및 연결 오류 방지
  return '/api';
};

const httpData = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // 데이터 조회 타임아웃 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

httpData.interceptors.request.use(
  (config) => {
    // [수정] Auth Store와 동일한 'jwt_token' 키 사용으로 통일
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default httpData;

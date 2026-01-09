// frontend/src/api/http.ts
import axios from 'axios';

const getBaseUrl = () => {
  // 1. 환경 변수 우선 (.env.development의 '/api' 또는 .env.production의 주소)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // 2. 환경 변수가 없을 경우 (Fallback)
  // 현재는 개발 환경에서 .env.development를 사용하므로 이 로직은 주로 배포 시 비상용
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8081/api`;
};

const instance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Error] 네트워크 연결 실패. 백엔드 서버 상태를 확인하세요.');
    } else if (error.response) {
      console.error(
        `[API Error] ${error.response.status} ${error.response.config.url}`,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

export default instance;

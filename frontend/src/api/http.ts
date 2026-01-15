// frontend/src/api/http.ts
import axios from 'axios';

const getBaseUrl = () => {
  // 1. 환경 변수 우선 (.env 파일에 VITE_API_URL이 설정되어 있다면 사용)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // 2. 환경 변수가 없을 경우 (Fallback)
  // [수정] 포트를 8081로 고정하지 않고, '/api' 상대 경로를 반환하여
  // vite.config.ts의 proxy 설정을 따르도록 변경합니다.
  return '/api';
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
    // [핵심 수정] stores/auth.ts에서 저장하는 키 이름인 'jwt_token'으로 변경
    const token = localStorage.getItem('jwt_token');
    
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
      // 401 에러(권한 없음) 발생 시 로그 출력 (필요시 여기서 로그아웃 처리 가능)
      if (error.response.status === 401) {
        console.warn('[API] 인증 실패: 토큰이 만료되었거나 유효하지 않습니다.');
      }
      
      console.error(
        `[API Error] ${error.response.status} ${error.response.config.url}`,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

export default instance;

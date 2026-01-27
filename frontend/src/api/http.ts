// frontend/src/api/http.ts
import axios from 'axios';

const getBaseUrl = () => {
  // 1. 환경 변수 우선 (.env 파일에 VITE_API_URL이 설정되어 있다면 사용)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // 2. 환경 변수가 없을 경우 (Fallback)
  return '/api';
};

const instance = axios.create({
  baseURL: getBaseUrl(),
  // [★핵심 개선] PDF 변환 대기 시간을 고려하여 10초 -> 100초로 변경
  timeout: 100000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    // stores/auth.ts에서 저장하는 키 이름인 'jwt_token'으로 변경
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
    // [수정] 401 Unauthorized 에러 처리 (토큰 만료/유효하지 않음)
    if (error.response && error.response.status === 401) {
      console.warn('[API] 인증 실패: 토큰이 만료되었거나 유효하지 않습니다. 자동 로그아웃 처리합니다.');
      
      // 1. 잔존하는 잘못된 인증 정보 삭제
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      
      // 2. 로그인 페이지가 아닐 경우 로그인 페이지로 강제 리다이렉트
      // window.location을 사용하여 앱 상태를 완전히 초기화(새로고침 효과)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?error=SessionExpired';
      }
      
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK') {
      console.error('[API Error] 네트워크 연결 실패. 백엔드 서버 상태를 확인하세요.');
    } else if (error.code === 'ECONNABORTED') {
      // 타임아웃 에러 처리
      console.error('[API Error] 요청 시간이 초과되었습니다.');
    } else if (error.response) {
      // 401 이외의 에러 로깅
      console.error(
        `[API Error] ${error.response.status} ${error.response.config.url}`,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

export default instance;

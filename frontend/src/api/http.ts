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
  // [★핵심 개선] 대용량 데이터 및 PDF 변환 대기 시간을 고려하여 100초로 설정
  timeout: 100000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    // stores/auth.ts에서 저장하는 키 이름인 'jwt_token'으로 사용
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
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // [신규 핵심 추가] 400 Bad Request 전역 예외 처리 (조회 제한 등)
      if (status === 400) {
        console.warn('[API] 400 Bad Request:', errorData);
        // NestJS의 BadRequestException 객체 내의 message 속성을 추출하여 화면에 경고창 출력
        const errMsg = errorData?.message || errorData || '잘못된 요청입니다. (조회 기간 등을 확인해주세요)';
        
        // 에러 메시지가 배열일 경우(Validation 에러 등) 텍스트로 변환, 아닐 경우 그대로 출력
        alert(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        
        return Promise.reject(error);
      }

      // 401 Unauthorized (토큰 만료 또는 유효하지 않은 인증)
      if (status === 401) {
        console.warn('[API] 인증 실패: 토큰이 만료되었거나 유효하지 않습니다. 자동 로그아웃 처리합니다.');
        
        // 1. 잔존하는 잘못된 인증 정보 완벽히 삭제
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        
        // 2. 에러 파라미터 없이 순수한 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }

      // 403 Forbidden (정상 로그인했으나 해당 메뉴/기능에 권한이 없는 경우)
      if (status === 403) {
        console.warn('[API] 권한 부족: 접근이 거부되었습니다.');
        
        // 권한이 없을 때만 명시적으로 Access Denied 에러창을 띄움
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?error=AccessDenied';
        }
        
        return Promise.reject(error);
      }
    }

    // 기타 네트워크 및 타임아웃 에러 로깅
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Error] 네트워크 연결 실패. 백엔드 서버 상태를 확인하세요.');
      alert('서버와의 네트워크 연결에 실패했습니다.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('[API Error] 요청 시간이 초과되었습니다.');
      alert('데이터 요청 시간이 초과되었습니다. 조회 기간을 줄여서 다시 시도해주세요.');
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

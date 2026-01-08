// frontend/src/api/http-data.ts
import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/auth";

// .env에서 설정한 8081 포트 주소를 가져옵니다.
const httpData: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_DATA_API_BASE_URL || "http://localhost:8081/api",
  timeout: 10000, // 데이터 양이 많을 수 있으므로 10초 대기
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 기존 로그인 토큰이 있다면 같이 보내 인증 통과
httpData.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
httpData.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("[Data API Error]", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default httpData;

// frontend/src/api/http.ts
import axios from "axios";

// [수정] 배포 시 Nginx Proxy를 타도록 상대 경로 혹은 환경변수 사용
// .env 파일의 변수명(VITE_API_BASE_URL)과 일치시킴
const baseURL = (import.meta.env.VITE_API_BASE_URL || "") + "/api";

const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;

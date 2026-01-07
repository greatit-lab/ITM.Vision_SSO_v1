// frontend/vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite"; // loadEnv 제거
import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  // [수정] 사용하지 않는 'const env = loadEnv(...)' 라인을 삭제했습니다.

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      // [수정] 외부 PC 접속 허용 (0.0.0.0은 모든 IP에서의 접근을 허용함)
      host: "0.0.0.0",

      // 1. 개발 PC 포트 설정 (8082)
      port: 8082,

      // 2. HTTPS 설정 (받아둔 pfx 파일 사용)
      https: {
        // [직접 수정] pfx 파일 경로와 비밀번호를 입력하세요.
        pfx: fs.readFileSync(path.resolve(__dirname, "cert/개발PC_IP.pfx")), 
        passphrase: "password", // 비밀번호가 없으면 이 줄 삭제 또는 빈 문자열
      },

      // 3. 프록시 설정
      proxy: {
        // [추가] Wafer 서비스 전용 (HTTP 8081)
        // 주의: 더 구체적인 경로('/api/wafer')를 일반 경로('/api')보다 위에 적어야 우선 적용됩니다.
        "/api/wafer": {
          target: "http://localhost:8081", // Wafer 서비스 포트
          changeOrigin: true,
          secure: false, // http이므로 false (상관없음)
        },

        // 기존 API 서비스 (HTTPS 44364)
        "/api": {
          target: "https://localhost:44364", // 백엔드는 로컬에서 돌므로 localhost 유지
          changeOrigin: true,
          secure: false, // 백엔드 인증서가 사설이어도 허용
        },
      },
    },
  };
});

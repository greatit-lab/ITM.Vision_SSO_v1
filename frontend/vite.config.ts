// frontend/vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      // 1. 외부 접속 허용 (개발 PC에서 타 기기 접속 테스트 시 필요)
      host: "0.0.0.0",

      // 2. 개발 PC 프론트엔드 구동 포트
      port: 8080,
      strictPort: true,

      // 3. HTTPS 설정 (AD 인증 테스트를 위한 로컬 인증서 사용)
      https: {
        pfx: fs.readFileSync(path.resolve(__dirname, "cert/10.135.77.222.pfx")),
        passphrase: "password", // 인증서 비밀번호
      },

      // 4. 프록시 설정 (.env.development의 VITE_API_URL=/api 요청을 백엔드로 전달)
      proxy: {
        // 1. 파일 다운로드/업로드 요청은 ITM.UploadApi (8082 포트)로 토스
        '/api/FileUpload': {
          target: 'http://10.172.111.93:8082', 
          changeOrigin: true,
          secure: false,
        },
        // 2. 그 외 일반 데이터 API 요청은 메인 Backend(예: 44364 포트)로 토스
        '/api': {
          target: 'https://127.0.0.1:44364',
          changeOrigin: true,
          secure: false,
        }
      }
    },
  };
});

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
      port: 8082,
      strictPort: true,

      // 3. HTTPS 설정 (AD 인증 테스트를 위한 로컬 인증서 사용)
      https: {
        pfx: fs.readFileSync(path.resolve(__dirname, "cert/10.135.77.222.pfx")), 
        passphrase: "password", // 인증서 비밀번호
      },

      // 4. 프록시 설정 (.env.development의 VITE_API_URL=/api 요청을 백엔드로 전달)
      proxy: {
        "/api": {
          // 개발 PC의 백엔드 구동 주소 (로컬 44364 포트)
          target: "https://127.0.0.1:44364", 
          changeOrigin: true,
          secure: false, // 로컬 자체 서명 인증서(Self-signed) 통과 허용
        },
      },
    },
  };
});

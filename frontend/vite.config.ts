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
        "/api": {
          target: "https://localhost:44364", // 백엔드 주소 (로컬 고정)
          changeOrigin: true,
          secure: false, // 백엔드가 HTTP여도 허용
        },
      },
    },
  };
});

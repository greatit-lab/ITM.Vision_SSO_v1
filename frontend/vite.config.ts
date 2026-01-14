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
      // 1. 외부 접속 허용
      host: "0.0.0.0",

      // 2. 개발 PC 포트 (8082)
      port: 8082,
      strictPort: true,

      // 3. HTTPS 설정 (pfx 인증서 사용)
      https: {
        pfx: fs.readFileSync(path.resolve(__dirname, "cert/10.135.77.222.pfx")), 
        passphrase: "password", // 인증서 비밀번호
      },

      // 4. 프록시 설정 (핵심 수정)
      proxy: {
        "/api": {
          // [중요!] 여기에 실제 DB API 서버의 IP 주소를 입력하세요.
          // 예: target: "http://192.168.0.100:8081",
          // target: "http://[DB_SERVER_IP]:8081", // 데모모드시
          target: "https://127.0.0.1:44364", 
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

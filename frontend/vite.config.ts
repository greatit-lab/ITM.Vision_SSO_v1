// frontend/vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0", // 모든 IP에서의 접속을 허용
    port: 7263, // 7263 포트 고정
    strictPort: true, 
    // ▼▼▼ [추가] 개발 서버용 프록시 설정 ▼▼▼
    proxy: {
      "/api": {
        target: "http://localhost:3000", // 백엔드 주소
        changeOrigin: true,
        secure: false,
        // 백엔드 Controller가 @Controller('api/...')로 설정되어 있으므로 rewrite 불필요
      },
    },
    // ▲▲▲ [추가 종료] ▲▲▲
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

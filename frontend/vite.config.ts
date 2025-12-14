// frontend/vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0", // 모든 IP에서의 접속을 허용
    port: 7263, // 여기를 7263으로 고정!
    strictPort: true, // 7263이 사용 중이면 에러를 냄 (다른 포트로 넘어가지 않음)
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

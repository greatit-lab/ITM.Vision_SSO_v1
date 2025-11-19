import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url"; // [추가]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // [추가] resolve 객체 전체 추가
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // [수정] 폰트 스택 우선순위 조정 (Inter -> 시스템 표준 -> 맑은 고딕 순)
        sans: [
          "Inter", 
          "ui-sans-serif", 
          "system-ui", 
          "-apple-system", 
          "BlinkMacSystemFont", 
          "Segoe UI", 
          "Roboto", 
          "Helvetica Neue", 
          "Arial", 
          "sans-serif"
        ],
      },
    },
  },
  plugins: [],
};

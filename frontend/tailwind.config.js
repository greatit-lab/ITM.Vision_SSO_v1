/** @type {import('tailwindcss').Config} */
export default {
  // ▼▼▼ 이 줄을 반드시 추가해주세요! (class 기반 다크모드 활성화) ▼▼▼
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 화사한 폰트 설정을 위해 기본 폰트 확장 (선택 사항)
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

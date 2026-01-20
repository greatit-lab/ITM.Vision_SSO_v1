// ecosystem.web.config.js
module.exports = {
  apps: [
    // 1. Backend Server (NestJS)
    {
      name: "itm-vision-backend",
      cwd: "./backend",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Data API 주소
        DATA_API_HOST: "http://[DB서버IP]:8081", 
        // AD 인증 설정 (필요시 수정)
        SAML_CALLBACK_URL: "https://[Web서버IP]:8080/api/auth/callback", 
      },
    },
  ],
};

// ecosystem.web.config.js
module.exports = {
  apps: [
    {
      name: "itm-vision-backend", // PM2에서 관리할 프로세스 이름
      cwd: "./backend", // [중요] 실행 기준 경로
      script: "dist/main.js", // 실행할 스크립트
      instances: 1, // 단일 인스턴스
      exec_mode: "fork", // 기본 모드

      env: {
        NODE_ENV: "production",
        PORT: 3000,

        // Data API 주소
        DATA_API_HOST: "http://[Data-API서버IP]:8081", // 실제 IP로 변경 필요 

        // AD 인증 설정
        SAML_ENTRY_POINT: "https://stsds.secsso.net/adfs/ls/",
        SAML_ISSUER: "https://[Web서버IP]:8080/", 
        SAML_CALLBACK_URL: "https://[Web서버IP]:8080/api/auth/callback",

        // [수정] 변수명 통일: SAML_CERT -> SAML_IDP_CERT
        SAML_IDP_CERT:
          "MIIC3D ... 운영인증서", 
      },
    },
  ],
};

// ecosystem.web.config.js
module.exports = {
  apps: [
    {
      name: "itm-vision-backend",     // PM2에서 관리할 프로세스 이름
      cwd: "./backend",               // [중요] 실행 기준 경로 (루트에서 backend 폴더로 진입)
      script: "dist/main.js",         // 실행할 스크립트 (backend/dist/main.js)
      env: {
        NODE_ENV: "production",       // 운영 모드 설정
        // PORT: 3000                 // backend/.env.production의 PORT를 따름
      },
      instances: 1,                   // 단일 인스턴스 (필요 시 'max'로 변경 가능)
      exec_mode: "fork"               // 기본 모드 (클러스터 모드 필요 시 'cluster')
    },
  ],
};

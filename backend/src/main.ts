// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestApplicationOptions } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { json, urlencoded } from 'express';

// [중요] 한국 시간대(KST)로 설정
process.env.TZ = 'Asia/Seoul';

async function bootstrap() {
  // NestJS의 httpsOptions 타입을 그대로 사용
  let httpsOptions: NestApplicationOptions['httpsOptions'] = undefined;

  // 개발 환경일 때만 HTTPS 적용
  if (process.env.NODE_ENV !== 'production') {
    // backend 폴더 실행 기준(process.cwd())에서 상위(../)로 올라가 frontend/cert 폴더 참조
    const keyPath = path.join(process.cwd(), '../frontend/cert/private.key');
    const certPath = path.join(process.cwd(), '../frontend/cert/cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      console.log(`[HTTPS] Found certificates at: ${keyPath}`);
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    } else {
      console.warn(`[HTTPS] Certificates not found at: ${keyPath}`);
      console.warn('[HTTPS] Starting in HTTP mode (SAML might fail).');
    }
  }

  // [핵심 수정] bodyParser: false 추가
  // httpsOptions 설정과 함께 BodyParser 비활성화 옵션을 전달해야
  // 아래의 50MB 제한 설정이 정상적으로 작동합니다.
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    bodyParser: false, 
  });

  // [설정] 요청 본문(Body) 크기 제한을 50MB로 증가
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // [중요] Frontend 요청 경로(/api/...)와 일치시키기 위해 Global Prefix 설정
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // .env.development에 설정된 포트 사용 (기본 44364)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const protocol = httpsOptions ? 'https' : 'http';
  console.log(`Application is running on: ${protocol}://localhost:${port}/api`);
}

void bootstrap();

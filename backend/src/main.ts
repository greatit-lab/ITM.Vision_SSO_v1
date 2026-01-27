// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestApplicationOptions } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { json, urlencoded } from 'express';
import { DateTransformInterceptor } from './common/interceptors/date-transform.interceptor';
import { DateInputPipe } from './common/pipes/date-input.pipe';

// [핵심 수정] process.env.TZ 설정 삭제함
// 서버를 UTC 환경으로 두어야 DB 데이터를 원본 그대로(Raw Data) 가져올 수 있습니다.

async function bootstrap() {
  let httpsOptions: NestApplicationOptions['httpsOptions'] = undefined;

  // 개발 환경일 때만 HTTPS 적용
  if (process.env.NODE_ENV !== 'production') {
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

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    bodyParser: false, 
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.setGlobalPrefix('api');

  // Input Pipe: 요청 데이터의 날짜 문자열 -> Date 변환
  app.useGlobalPipes(new DateInputPipe());

  // Output Interceptor: 응답 데이터의 Date -> 문자열 변환 (UTC 기준 포맷팅)
  app.useGlobalInterceptors(new DateTransformInterceptor());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const protocol = httpsOptions ? 'https' : 'http';
  console.log(`Application is running on: ${protocol}://localhost:${port}/api`);
}

void bootstrap();

// backend/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// [1] 토큰 페이로드 타입 정의
export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  groups: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'itm-vision-secret-key',
    });
  }

  // [2] async 제거 (비동기 작업이 없음) 및 Payload 타입 적용
  validate(payload: JwtPayload) {
    return { 
      userId: payload.sub, 
      role: payload.role, 
      groups: payload.groups 
    };
  }
}

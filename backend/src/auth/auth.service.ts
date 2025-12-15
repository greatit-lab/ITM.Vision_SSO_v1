// backend/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, LoginResult } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // [수정] await 추가 (signAsync 사용)
  async login(user: User): Promise<LoginResult> {
    const payload = { 
      username: user.userId, 
      sub: user.userId, 
      groups: user.groups 
    };
    
    // sign 대신 signAsync 사용 권장
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: user,
    };
  }
}

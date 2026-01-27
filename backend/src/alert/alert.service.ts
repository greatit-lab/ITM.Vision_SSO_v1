// backend/src/alert/alert.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

@Injectable()
export class AlertService {
  private readonly DOMAIN = 'alert';

  constructor(private readonly dataApiService: DataApiService) {}

  async getAlerts(userId?: string, token?: string) {
    const params = userId ? { userId } : undefined;
    
    // [수정] 6번째 인자(options) 객체에 token 전달
    return this.dataApiService.request<any[]>(
      this.DOMAIN,
      'get',
      '',
      undefined,
      params,
      { token } // RequestOptions 객체로 전달
    );
  }
}

// backend/src/alert/alert.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

@Injectable()
export class AlertService {
  // Data API의 Controller 도메인
  private readonly DOMAIN = 'alert';

  constructor(private readonly dataApiService: DataApiService) {}

  // 1. 내 알림 조회 (Data API 호출)
  async getMyAlerts(userId: string) {
    // GET http://[DataAPI]/api/alert?userId=...
    return this.dataApiService.request<any[]>(
      this.DOMAIN,
      'get',
      '', // endpoint (루트)
      undefined,
      { userId } // Query Parameter
    );
  }

  // 2. 안 읽은 개수 조회
  async getUnreadCount(userId: string) {
    // GET http://[DataAPI]/api/alert/unread-count?userId=...
    return this.dataApiService.request<number>(
      this.DOMAIN,
      'get',
      'unread-count',
      undefined,
      { userId }
    );
  }

  // 3. 읽음 처리
  async readAlert(id: number) {
    // POST http://[DataAPI]/api/alert/:id/read
    return this.dataApiService.request(
      this.DOMAIN,
      'post',
      `${id}/read`
    );
  }
}

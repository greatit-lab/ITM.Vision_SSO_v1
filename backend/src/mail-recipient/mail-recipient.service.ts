// backend/src/mail-recipient/mail-recipient.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

@Injectable()
export class MailRecipientService {
  private readonly DOMAIN = 'mail-recipient';

  constructor(private readonly dataApiService: DataApiService) {}

async getAllRecipients(token: string): Promise<any[]> {
  const result = awit this.dataApiService.request<any[]>(
    this.DOMAIN,
    'get',
    '',
    undefined,
    undefined,
    { token },
  );
  return result || [];
}

async getSystemRecipients(): Promise<any[]> {
  const result = await this.dataApiService.request<any[]>(
    this.DOMAIN,
    'get',
    'system',
  );
  return result || [];
}

async getMyRecipients(token: string): Promise<any[]> {
  const result = await this.dataApiService.request<any[]>(
    this.DOMAIN,
    'get',
    'my',
    undefined,
    undefined,
    { token },
  );
  return result || [];
}

async createRecipient(
  token: string,
  data: {
    recipientEmail: string;
    recipientName?: string;
    recipientType?: string;
  },
): Promise<any> {
  return this.dataApiService.request<any>(
    this.DOMAIN,
    'post',
    '',
    data,
    undefined,
    { token },
  );
}

async updateRecipient(
  id: number,
  token: string,
  data: {
    recipientEmail?: string;
    recipientName?: string;
    isActive?: boolean;
  },
): Promise<any> {
  return this.dataApiService.request<any>(
    this.DOMAIN,
    'put',
    String(id),
    data,
    undefined,
    { token },
  );
}

async deleteRecipient(id: number, token: string): Promise<any> {
  return this.dataApiService.request<any>(
    this.DOMAIN,
    'delete',
    String(id),
    undefined,
    undefined,
    { token },
  );
}

/**
 * 활성 수신자 이메일 목록 조회 (메일 발송용)
 * @param type - 'SYSTEM' 또는 undefined(전체)
 */
async getActiveRecipientEmails(type?: string): Promise<string[]> {
  const result = await this.dataApiService.request<any[]>(
    this.DOMAIN,
    'get',
    '',
    undefined,
    undefined,
    // token 불필요 (내부 메일 발송용)
  );

  // SYSTEM 또는 USER 모두 포함 (메일 발송용)
  const filtered = type
    ? result?.filter((r: any) => r.recipientType === type) || []
    : result || []; // type 없으면 전체 조회

  return filtered.map((r: any) => r.recipientEmail) as stringp[];
}
}



















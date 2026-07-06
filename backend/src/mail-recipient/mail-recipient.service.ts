// backend/src/mail-recipient/mail-recipient.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

interface AdminUser {
  loginId: string;
  role?: string;
  assignedBy?: string;
  assignedAt?: string;
}

interface MailRecipient {
  id?: number;
  loginId?: string;
  recipientEmail: string;
  recipientName?: string;
  recipientType?: string;
  isActive?: boolean;
}

@Injectable()
export class MailRecipientService {
  private readonly logger = new Logger(MailRecipientService.name);
  private readonly DOMAIN = 'mail-recipient';

  constructor(private readonly dataApiService: DataApiService) {}

  async getAllRecipients(token: string): Promise<MailRecipient[]> {
    const result = await this.dataApiService.request<MailRecipient[]>(
      this.DOMAIN,
      'get',
      '',
      undefined,
      undefined,
      { token },
    );

    return result || [];
  }

  async getSystemRecipients(): Promise<MailRecipient[]> {
    const result = await this.dataApiService.request<MailRecipient[]>(
      this.DOMAIN,
      'get',
      'system',
    );

    return result || [];
  }

  async getMyRecipients(token: string): Promise<MailRecipient[]> {
    const result = await this.dataApiService.request<MailRecipient[]>(
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
   * 활성 수신자 이메일 목록 조회
   * - 기존 메일 수신자 관리 화면에서 등록한 수신자 기준
   * - Board Admin/Manager 알림에는 getBoardAdminManagerRecipientEmails() 사용 권장
   */
  async getActiveRecipientEmails(type?: string): Promise<string[]> {
    const result = await this.dataApiService.request<MailRecipient[]>(
      this.DOMAIN,
      'get',
      '',
      undefined,
      undefined,
    );

    const filtered = type
      ? result?.filter((r) => r.recipientType === type) || []
      : result || [];

    return this.unique(
      filtered
        .map((r) => r.recipientEmail)
        .filter((email): email is string => Boolean(email)),
    );
  }

  /**
   * Q&A Board 신규 게시글 알림 대상 조회
   * - cfg_admin_user 기준 Admin, Manager 권한자에게 발송
   * - recipient 값은 loginId 또는 email 모두 가능
   * - KnoxMailService에서 loginId를 환경별 메일 도메인으로 보정
   */
  async getBoardAdminManagerRecipientEmails(): Promise<string[]> {
    const admins = await this.dataApiService.request<AdminUser[]>(
      'admin',
      'get',
      'admins',
      undefined,
      undefined,
    );

    if (!admins || admins.length === 0) {
      this.logger.warn(
        '[Board Mail] No admin users found from Data API /api/admin/admins.',
      );
      return [];
    }

    const recipients = admins
      .filter((admin) => this.isBoardMailTargetRole(admin.role))
      .map((admin) => admin.loginId)
      .filter((loginId): loginId is string => Boolean(loginId));

    const uniqueRecipients = this.unique(recipients);

    this.logger.log(
      `[Board Mail] Admin/Manager recipients resolved: ${uniqueRecipients.length}`,
    );

    return uniqueRecipients;
  }

  private isBoardMailTargetRole(role?: string): boolean {
    const normalized = String(role || '')
      .trim()
      .toUpperCase();

    return normalized === 'ADMIN' || normalized === 'MANAGER';
  }

  private unique(values: string[]): string[] {
    return Array.from(
      new Set(
        values.map((value) => value.trim()).filter((value) => value.length > 0),
      ),
    );
  }
}

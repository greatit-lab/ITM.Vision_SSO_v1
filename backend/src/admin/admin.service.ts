// backend/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';
import { KnoxMailService } from '../knox/knox-mail.service';
import { MailRecipientService } from '../mail-recipient/mail-recipient.service';

import {
  CreateAdminDto,
  CreateAccessCodeDto,
  UpdateAccessCodeDto,
  CreateGuestDto,
  ApproveGuestRequestDto,
  RejectGuestRequestDto,
  CreateSeverityDto,
  UpdateSeverityDto,
  CreateMetricDto,
  UpdateMetricDto,
  UpdateNewServerDto,
  CreateCfgServerDto,
  UpdateCfgServerDto,
} from './dto/admin.dto';
import * as fs from 'fs';
import * as path from 'path';

export interface AdminUserResult {
  loginId: string;
  role?: string;
  [key: string]: any;
}
export interface GuestAccessResult {
  loginId: string;
  validUntil?: string | Date;
  grantedRole?: string;
  [key: string]: any;
}
export interface GuestRequestResult {
  reqId: number;
  loginId: string;
  status: string;
  reason?: string;
  [key: string]: any;
}
export type GenericResult = Record<string, any>;

@Injectable()
export class AdminService {
  private readonly DOMAIN = 'admin';
  private readonly templatesDir = path.join(
    __dirname,
    '..',
    'knox',
    'email-templates',
  );

  constructor(
    private readonly api: DataApiService,
    private readonly knoxMailService: KnoxMailService,
    private readonly mailRecipientService: MailRecipientService,
  ) {}

  async getAllUsers(): Promise<AdminUserResult[] | null> {
    return this.api.request<AdminUserResult[]>(this.DOMAIN, 'get', 'users');
  }
  async getAllAdmins(): Promise<AdminUserResult[] | null> {
    return this.api.request<AdminUserResult[]>(this.DOMAIN, 'get', 'admins');
  }
  async addAdmin(data: CreateAdminDto): Promise<AdminUserResult | null> {
    return this.api.request<AdminUserResult>(
      this.DOMAIN,
      'post',
      'admins',
      data,
    );
  }
  async deleteAdmin(loginId: string): Promise<AdminUserResult | null> {
    return this.api.request<AdminUserResult>(
      this.DOMAIN,
      'delete',
      `admins/${loginId}`,
    );
  }

  async getAllAccessCodes(): Promise<GuestAccessResult[] | null> {
    return this.api.request<GuestAccessResult[]>(
      this.DOMAIN,
      'get',
      'access-codes',
    );
  }
  async createAccessCode(
    data: CreateAccessCodeDto,
  ): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'post',
      'access-codes',
      data,
    );
  }
  async updateAccessCode(
    deptid: string,
    data: UpdateAccessCodeDto,
  ): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'put',
      `access-codes/${deptid}`,
      data,
    );
  }
  async deleteAccessCode(deptid: string): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'delete',
      `access-codes/${deptid}`,
    );
  }

  async getExceptionUsers(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'exceptions');
  }
  async addExceptionUser(data: any): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'post',
      'exceptions',
      data,
    );
  }
  async updateExceptionUserStatus(
    loginId: string,
    isActive: string,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'put',
      `exceptions/${loginId}/status`,
      { isActive },
    );
  }
  async deleteExceptionUser(loginId: string): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'delete',
      `exceptions/${loginId}`,
    );
  }

  async getAllGuests(): Promise<GuestAccessResult[] | null> {
    return this.api.request<GuestAccessResult[]>(this.DOMAIN, 'get', 'guests');
  }
  
  async addGuest(
    data: CreateGuestDto & { grantedRole?: string },
  ): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'post',
      'guests',
      data,
    );
  }
  async deleteGuest(loginId: string): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'delete',
      `guests/${loginId}`,
    );
  }

  async getGuestRequests(): Promise<GuestRequestResult[] | null> {
    return this.api.request<GuestRequestResult[]>(
      this.DOMAIN,
      'get',
      'guest/request',
    );
  }

  async approveGuestRequest(
    data: ApproveGuestRequestDto & {
      validUntil?: Date | string;
      grantedRole?: string;
    },
  ): Promise<GuestAccessResult | null> {
    const guest = await this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'put',
      `guest/request/${data.reqId}/approve`,
      {
        approverId: data.approverId,
        validUntil: data.validUntil,
        grantedRole: data.grantedRole,
      },
    );

    if (guest) {
      this.sendGuestApprovalMail(guest, data.approverId).catch((err) => {
        console.error(
          '[AdminService] Failed to send guest approval email:',
          err,
        );
      });
    }

    return guest;
  }

  async rejectGuestRequest(
    data: RejectGuestRequestDto,
  ): Promise<GuestRequestResult | null> {
    const retuest = await this.api.request<GuestRequestResult>(
      this.DOMAIN,
      'put',
      `guest/request/${data.reqId}/reject`,
      { rejectorId: data.rejectorId },
    );
  }

  if (request) {
      this.sendGuestREjectMail(request, data.rejectorId).catch((err) => {
        console.error(
          '[AdminService] Failed to send guest rejection email:',
          err,
        );
      });
    }

    return request;
  }
  
  async getSeverities(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'severity');
  }
  async createSeverity(data: CreateSeverityDto): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'post',
      'severity',
      data,
    );
  }
  async updateSeverity(
    errorId: string,
    data: UpdateSeverityDto,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'put',
      `severity/${encodeURIComponent(errorId)}`,
      data,
    );
  }
  async deleteSeverity(errorId: string): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'delete',
      `severity/${encodeURIComponent(errorId)}`,
    );
  }

  async getMetrics(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'metrics');
  }
  async createMetric(data: CreateMetricDto): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'post',
      'metrics',
      data,
    );
  }
  async updateMetric(
    metricName: string,
    data: UpdateMetricDto,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'put',
      `metrics/${encodeURIComponent(metricName)}`,
      data,
    );
  }
  async deleteMetric(metricName: string): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'delete',
      `metrics/${encodeURIComponent(metricName)}`,
    );
  }

  async getRefEquipments(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(
      this.DOMAIN,
      'get',
      'ref-equipments',
    );
  }

  async getNewServerConfig(): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'get', 'new-server');
  }
  async updateNewServerConfig(
    data: UpdateNewServerDto,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'put',
      'new-server',
      data,
    );
  }
  async getCfgServers(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'servers');
  }
  async createCfgServer(
    data: CreateCfgServerDto,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'post',
      'servers',
      data,
    );
  }
  async updateCfgServer(
    eqpid: string,
    data: UpdateCfgServerDto,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'put',
      `servers/${eqpid}`,
      data,
    );
  }
  async deleteCfgServer(eqpid: string): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'delete',
      `servers/${eqpid}`,
    );
  }

  async logAccess(data: {
    loginId: string;
    menuName: string;
    accessUrl: string;
  }): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'post',
      'access-log',
      data,
    );
  }

  async getUsageAnalytics(
    startDate: string,
    endDate: string,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'get',
      `usage-analytics?startDate=${startDate}&endDate=${endDate}`,
    );
  }

  async getStorageUsage(
    startDate: string,
    endDate: string,
    interval: string,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN,
      'get',
      `storage-usage?startDate=${startDate}&endDate=${endDate}&interval=${interval}`,
    );
  }

  async syncStorageNow(): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'post', 'storage-sync');
  }

  async getMaintenanceStatus(): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'get', 'maintenance');
  }

  async updateMaintenanceStatus(
    status: boolean,
    expectedTime?: string,
  ): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'post', 'maintenance', {
      status,
      expectedTime,
    });
  }

  // ==========================================
  // [메일 발송] 게스트 승인 알림
  // ==========================================
  private async sendGuestApprovalMail(
    guest: GuestAccessResult,
    approverId: string,
  ): Promise<void> {
    const recipients: string[] = [guest.loginId];
    const systemRecipients =
      await this.mailRecipientService.getActiveREcipientEmails('SYSTEM');
    if (systemRecipients) {
      recipients.push(...systemREcipients);
    }

    const html = this.renderTemplate('guest-approval.html', {
      loginId: guest.loginId,
      grantedRole: guest.grantedRole || 'GUEST',
      validUntil: guest.validUntil
        ? new Date(guest.validUntil as string).toLocaleString('ko-KR')
        : '설정 없음',
      approverName: approverId,
      link: 'https://localhost:8080',
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: `[I:Vision] 게스트 접근이 승인되었습니다 (${guest.loginId})`,
      content: html,
    });
  }

  // ==========================================
  // [메일 발송] 게스트 거절 알림
  // ==========================================
  private async sendGuestRejectMail(
    request: GuestRequestResult,
    rejectorId: string,
  ): Promise<void> {
    const recipients: string{} = [request.loginId];
    const systemREcipients =
      await this.mailRecipientService.getActiveRecipientEmails('SYSTEM');
    if (systemRecipients) {
      recipients.push(...systemREcipients);
    }

    const html = this.renderTemplate('guest-rejection.html', {
      loginId: request.loginId,
      reason: request.reason || '등록되지 않음',
      rejectorName: rejectorId,
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: `[I:Vision] 게스트 접근이 거절되었습니다 (${request.loginID})`,
      content: html,
    });
  }

  // ==========================================
  // [공통] 이메일 템플릿 렌더링
  // ==========================================
  private renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    try {
      const templatePath = path.join(this.templatesDir, templateName);
      let html = fs.readFileSync(templatePath, 'utf-8');

      for (const [key, value] of Object.entries(variables)) {
        html = html.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      return html;
    } catch (error) {
      console.error;
        `[AdminService] Failed to render template ${templateName}:`,
        error,
      );
      return `<p>알림이 있습니다. I:Vision헤엇 확인해 주세요.</p>`;
    }
  }
}

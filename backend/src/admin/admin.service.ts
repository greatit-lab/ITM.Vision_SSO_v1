// backend/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

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

// Data API 반환 타입 정의 (ESLint 'no-unsafe-return' 해결용)
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

// 일반적인 객체 응답 (엄격한 타입 정의가 필요 없는 경우 사용)
export type GenericResult = Record<string, any>;

@Injectable()
export class AdminService {
  private readonly DOMAIN = 'admin';

  constructor(private readonly api: DataApiService) {}

  // ==========================================
  // [User & Admin Management]
  // ==========================================
  async getAllUsers(): Promise<AdminUserResult[] | null> {
    return this.api.request<AdminUserResult[]>(this.DOMAIN, 'get', 'users');
  }

  async getAllAdmins(): Promise<AdminUserResult[] | null> {
    return this.api.request<AdminUserResult[]>(this.DOMAIN, 'get', 'admins');
  }

  async addAdmin(data: CreateAdminDto): Promise<AdminUserResult | null> {
    return this.api.request<AdminUserResult>(this.DOMAIN, 'post', 'admins', data);
  }

  async deleteAdmin(loginId: string): Promise<AdminUserResult | null> {
    return this.api.request<AdminUserResult>(this.DOMAIN, 'delete', `admins/${loginId}`);
  }

  // ==========================================
  // [Access Codes]
  // ==========================================
  async getAllAccessCodes(): Promise<GuestAccessResult[] | null> {
    return this.api.request<GuestAccessResult[]>(this.DOMAIN, 'get', 'guest/access');
  }

  async createAccessCode(data: CreateAccessCodeDto): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(this.DOMAIN, 'post', 'guest/access', data);
  }

  async updateAccessCode(compid: string, data: UpdateAccessCodeDto): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'put', 
      `access-codes/${compid}`,
      data,
    );
  }

  async deleteAccessCode(compid: string): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(this.DOMAIN, 'delete', `guest/access/${compid}`);
  }

  // ==========================================
  // [Guest Management]
  // ==========================================
  async getAllGuests(): Promise<GuestAccessResult[] | null> {
    return this.api.request<GuestAccessResult[]>(this.DOMAIN, 'get', 'guests');
  }

  async addGuest(data: CreateGuestDto): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(this.DOMAIN, 'post', 'guests', data);
  }

  async deleteGuest(loginId: string): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(this.DOMAIN, 'delete', `guests/${loginId}`);
  }

  async getGuestRequests(): Promise<GuestRequestResult[] | null> {
    return this.api.request<GuestRequestResult[]>(this.DOMAIN, 'get', 'guest/request');
  }

  async approveGuestRequest(data: ApproveGuestRequestDto): Promise<GuestAccessResult | null> {
    return this.api.request<GuestAccessResult>(
      this.DOMAIN,
      'put',
      `guest/request/${data.reqId}/approve`,
      { approverId: data.approverId },
    );
  }

  async rejectGuestRequest(data: RejectGuestRequestDto): Promise<GuestRequestResult | null> {
    return this.api.request<GuestRequestResult>(
      this.DOMAIN,
      'put',
      `guest/request/${data.reqId}/reject`,
      { rejectorId: data.rejectorId },
    );
  }

  // ==========================================
  // [Infra] Error Severity
  // ==========================================
  async getSeverities(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'severity');
  }

  async createSeverity(data: CreateSeverityDto): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'post', 'severity', data);
  }

  async updateSeverity(errorId: string, data: UpdateSeverityDto): Promise<GenericResult | null> {
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

  // ==========================================
  // [Infra] Metrics
  // ==========================================
  async getMetrics(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'metrics');
  }

  async createMetric(data: CreateMetricDto): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'post', 'metrics', data);
  }

  async updateMetric(metricName: string, data: UpdateMetricDto): Promise<GenericResult | null> {
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

  // ==========================================
  // [Equipments]
  // ==========================================
  async getRefEquipments(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'ref-equipments');
  }

  // ==========================================
  // [System Config] (추가된 부분)
  // ==========================================
  async getNewServerConfig(): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'get', 'new-server');
  }

  async updateNewServerConfig(data: UpdateNewServerDto): Promise<GenericResult | null> {
    // Put 요청으로 생성/수정(Upsert) 처리
    return this.api.request<GenericResult>(this.DOMAIN, 'put', 'new-server', data);
  }

  async getCfgServers(): Promise<GenericResult[] | null> {
    return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'servers');
  }

  // 개별 서버 추가는 Data API Controller에 구현되지 않았으므로 생략 (요구사항 없음)
  async createCfgServer(data: CreateCfgServerDto): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'post', 'servers', data);
  }

  async updateCfgServer(eqpid: string, data: UpdateCfgServerDto): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'put', `servers/${eqpid}`, data);
  }

  // 삭제 기능은 Data API Controller에 구현되지 않았으므로 생략
  async deleteCfgServer(eqpid: string): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'delete', `servers/${eqpid}`);
  }
}

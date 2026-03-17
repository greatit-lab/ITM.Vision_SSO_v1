// backend/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

import {
  CreateAdminDto, CreateAccessCodeDto, UpdateAccessCodeDto,
  CreateGuestDto, ApproveGuestRequestDto, RejectGuestRequestDto,
  CreateSeverityDto, UpdateSeverityDto, CreateMetricDto,
  UpdateMetricDto, UpdateNewServerDto, CreateCfgServerDto,
  UpdateCfgServerDto,
} from './dto/admin.dto';

export interface AdminUserResult { loginId: string; role?: string; [key: string]: any; }
export interface GuestAccessResult { loginId: string; validUntil?: string | Date; grantedRole?: string; [key: string]: any; }
export interface GuestRequestResult { reqId: number; loginId: string; status: string; reason?: string; [key: string]: any; }
export type GenericResult = Record<string, any>;

@Injectable()
export class AdminService {
  private readonly DOMAIN = 'admin';

  constructor(private readonly api: DataApiService) {}

  async getAllUsers(): Promise<AdminUserResult[] | null> { return this.api.request<AdminUserResult[]>(this.DOMAIN, 'get', 'users'); }
  async getAllAdmins(): Promise<AdminUserResult[] | null> { return this.api.request<AdminUserResult[]>(this.DOMAIN, 'get', 'admins'); }
  async addAdmin(data: CreateAdminDto): Promise<AdminUserResult | null> { return this.api.request<AdminUserResult>(this.DOMAIN, 'post', 'admins', data); }
  async deleteAdmin(loginId: string): Promise<AdminUserResult | null> { return this.api.request<AdminUserResult>(this.DOMAIN, 'delete', `admins/${loginId}`); }

  // [수정됨] Data-API의 바뀐 엔드포인트(/admin/access-codes)로 경로 수정 및 파라미터를 deptid로 변경
  async getAllAccessCodes(): Promise<GuestAccessResult[] | null> { return this.api.request<GuestAccessResult[]>(this.DOMAIN, 'get', 'access-codes'); }
  async createAccessCode(data: CreateAccessCodeDto): Promise<GuestAccessResult | null> { return this.api.request<GuestAccessResult>(this.DOMAIN, 'post', 'access-codes', data); }
  async updateAccessCode(deptid: string, data: UpdateAccessCodeDto): Promise<GuestAccessResult | null> { return this.api.request<GuestAccessResult>(this.DOMAIN, 'put', `access-codes/${deptid}`, data); }
  async deleteAccessCode(deptid: string): Promise<GuestAccessResult | null> { return this.api.request<GuestAccessResult>(this.DOMAIN, 'delete', `access-codes/${deptid}`); }

  async getAllGuests(): Promise<GuestAccessResult[] | null> { return this.api.request<GuestAccessResult[]>(this.DOMAIN, 'get', 'guests'); }
  async addGuest(data: CreateGuestDto): Promise<GuestAccessResult | null> { return this.api.request<GuestAccessResult>(this.DOMAIN, 'post', 'guests', data); }
  async deleteGuest(loginId: string): Promise<GuestAccessResult | null> { return this.api.request<GuestAccessResult>(this.DOMAIN, 'delete', `guests/${loginId}`); }

  async getGuestRequests(): Promise<GuestRequestResult[] | null> { return this.api.request<GuestRequestResult[]>(this.DOMAIN, 'get', 'guest/request'); }
  async approveGuestRequest(data: ApproveGuestRequestDto): Promise<GuestAccessResult | null> { return this.api.request<GuestAccessResult>(this.DOMAIN, 'put', `guest/request/${data.reqId}/approve`, { approverId: data.approverId }); }
  async rejectGuestRequest(data: RejectGuestRequestDto): Promise<GuestRequestResult | null> { return this.api.request<GuestRequestResult>(this.DOMAIN, 'put', `guest/request/${data.reqId}/reject`, { rejectorId: data.rejectorId }); }

  async getSeverities(): Promise<GenericResult[] | null> { return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'severity'); }
  async createSeverity(data: CreateSeverityDto): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'post', 'severity', data); }
  async updateSeverity(errorId: string, data: UpdateSeverityDto): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'put', `severity/${encodeURIComponent(errorId)}`, data); }
  async deleteSeverity(errorId: string): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'delete', `severity/${encodeURIComponent(errorId)}`); }

  async getMetrics(): Promise<GenericResult[] | null> { return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'metrics'); }
  async createMetric(data: CreateMetricDto): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'post', 'metrics', data); }
  async updateMetric(metricName: string, data: UpdateMetricDto): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'put', `metrics/${encodeURIComponent(metricName)}`, data); }
  async deleteMetric(metricName: string): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'delete', `metrics/${encodeURIComponent(metricName)}`); }

  async getRefEquipments(): Promise<GenericResult[] | null> { return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'ref-equipments'); }

  async getNewServerConfig(): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'get', 'new-server'); }
  async updateNewServerConfig(data: UpdateNewServerDto): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'put', 'new-server', data); }
  async getCfgServers(): Promise<GenericResult[] | null> { return this.api.request<GenericResult[]>(this.DOMAIN, 'get', 'servers'); }
  async createCfgServer(data: CreateCfgServerDto): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'post', 'servers', data); }
  async updateCfgServer(eqpid: string, data: UpdateCfgServerDto): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'put', `servers/${eqpid}`, data); }
  async deleteCfgServer(eqpid: string): Promise<GenericResult | null> { return this.api.request<GenericResult>(this.DOMAIN, 'delete', `servers/${eqpid}`); }

  async logAccess(data: { loginId: string; menuName: string; accessUrl: string }): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(this.DOMAIN, 'post', 'access-log', data);
  }

  async getUsageAnalytics(startDate: string, endDate: string): Promise<GenericResult | null> {
    return this.api.request<GenericResult>(
      this.DOMAIN, 
      'get', 
      `usage-analytics?startDate=${startDate}&endDate=${endDate}`
    );
  }
}

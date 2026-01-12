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

@Injectable()
export class AdminService {
  private readonly DOMAIN = 'admin';

  constructor(private readonly api: DataApiService) {}

  // ==========================================
  // [User & Admin Management]
  // ==========================================
  async getAllUsers() {
    return this.api.request(this.DOMAIN, 'get', 'users');
  }

  async getAllAdmins() {
    return this.api.request(this.DOMAIN, 'get', 'admins');
  }

  async addAdmin(data: CreateAdminDto) {
    return this.api.request(this.DOMAIN, 'post', 'admins', data);
  }

  async deleteAdmin(loginId: string) {
    return this.api.request(this.DOMAIN, 'delete', `admins/${loginId}`);
  }

  // ==========================================
  // [Access Codes]
  // ==========================================
  async getAllAccessCodes() {
    return this.api.request(this.DOMAIN, 'get', 'access-codes');
  }

  async createAccessCode(data: CreateAccessCodeDto) {
    return this.api.request(this.DOMAIN, 'post', 'access-codes', data);
  }

  async updateAccessCode(compid: string, data: UpdateAccessCodeDto) {
    return this.api.request(this.DOMAIN, 'patch', `access-codes/${compid}`, data);
  }

  async deleteAccessCode(compid: string) {
    return this.api.request(this.DOMAIN, 'delete', `access-codes/${compid}`);
  }

  // ==========================================
  // [Guest Management]
  // ==========================================
  async getAllGuests() {
    return this.api.request(this.DOMAIN, 'get', 'guests');
  }

  async addGuest(data: CreateGuestDto) {
    return this.api.request(this.DOMAIN, 'post', 'guests', data);
  }

  async deleteGuest(loginId: string) {
    return this.api.request(this.DOMAIN, 'delete', `guests/${loginId}`);
  }

  async getGuestRequests() {
    return this.api.request(this.DOMAIN, 'get', 'guest-requests');
  }

  async approveGuestRequest(data: ApproveGuestRequestDto) {
    return this.api.request(this.DOMAIN, 'post', 'guest-requests/approve', data);
  }

  async rejectGuestRequest(data: RejectGuestRequestDto) {
    return this.api.request(this.DOMAIN, 'post', 'guest-requests/reject', data);
  }

  // ==========================================
  // [Infra] Error Severity
  // ==========================================
  async getSeverities() {
    return this.api.request(this.DOMAIN, 'get', 'severities');
  }

  async createSeverity(data: CreateSeverityDto) {
    return this.api.request(this.DOMAIN, 'post', 'severities', data);
  }

  async updateSeverity(errorId: string, data: UpdateSeverityDto) {
    return this.api.request(
      this.DOMAIN,
      'patch',
      `severities/${encodeURIComponent(errorId)}`,
      data,
    );
  }

  async deleteSeverity(errorId: string) {
    return this.api.request(
      this.DOMAIN,
      'delete',
      `severities/${encodeURIComponent(errorId)}`,
    );
  }

  // ==========================================
  // [Infra] Metrics
  // ==========================================
  async getMetrics() {
    return this.api.request(this.DOMAIN, 'get', 'metrics');
  }

  async createMetric(data: CreateMetricDto) {
    return this.api.request(this.DOMAIN, 'post', 'metrics', data);
  }

  async updateMetric(metricName: string, data: UpdateMetricDto) {
    return this.api.request(
      this.DOMAIN,
      'patch',
      `metrics/${encodeURIComponent(metricName)}`,
      data,
    );
  }

  async deleteMetric(metricName: string) {
    return this.api.request(
      this.DOMAIN,
      'delete',
      `metrics/${encodeURIComponent(metricName)}`,
    );
  }

  // ==========================================
  // [Equipments]
  // ==========================================
  async getRefEquipments() {
    return this.api.request(this.DOMAIN, 'get', 'ref-equipments');
  }

  // ==========================================
  // [System Config]
  // ==========================================
  async getNewServerConfig() {
    return this.api.request(this.DOMAIN, 'get', 'new-server');
  }

  async updateNewServerConfig(data: UpdateNewServerDto) {
    return this.api.request(this.DOMAIN, 'patch', 'new-server', data);
  }

  async getCfgServers() {
    return this.api.request(this.DOMAIN, 'get', 'cfg-servers');
  }

  async createCfgServer(data: CreateCfgServerDto) {
    return this.api.request(this.DOMAIN, 'post', 'cfg-servers', data);
  }

  async updateCfgServer(eqpid: string, data: UpdateCfgServerDto) {
    return this.api.request(this.DOMAIN, 'patch', `cfg-servers/${eqpid}`, data);
  }

  async deleteCfgServer(eqpid: string) {
    return this.api.request(this.DOMAIN, 'delete', `cfg-servers/${eqpid}`);
  }
}

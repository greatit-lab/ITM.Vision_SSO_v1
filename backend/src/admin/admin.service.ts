// backend/src/admin/admin.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';

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
  private readonly logger = new Logger(AdminService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiHost = this.configService.getOrThrow<string>('DATA_API_HOST');
    this.baseUrl = `${apiHost}/api/admin`;
  }

  // ==========================
  // 공통 유틸
  // ==========================
  private stringifyErrorData(data: unknown): string {
    if (typeof data === 'string') return data;
    if (data instanceof Object) return JSON.stringify(data);
    return 'Unknown Error';
  }

  /**
   * [Core] 공통 API 요청 처리
   */
  private async requestApi<T>(
    method: 'get' | 'post' | 'patch' | 'delete' | 'put',
    endpoint: string,
    data?: unknown,
    params?: unknown,
  ): Promise<T> {
    const targetPath = `${this.baseUrl}/${endpoint}`;

    try {
      this.logger.debug(`[Requesting ${method.toUpperCase()}] ${targetPath}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetPath,
          data,
          params,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Unknown Error';
      let statusCode = 500;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;
        statusCode = axiosError.response?.status ?? 500;
        errorMessage = this.stringifyErrorData(axiosError.response?.data);

        this.logger.error(
          `[Data API Error] ${statusCode} - ${targetPath} / ${errorMessage}`,
        );
      }

      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }

  // ==========================================
  // [User & Admin Management]
  // ==========================================
  async getAllUsers() {
    return this.requestApi('get', 'users');
  }

  async getAllAdmins() {
    return this.requestApi('get', 'admins');
  }

  async addAdmin(data: CreateAdminDto) {
    return this.requestApi('post', 'admins', data);
  }

  async deleteAdmin(loginId: string) {
    return this.requestApi('delete', `admins/${loginId}`);
  }

  // ==========================================
  // [Access Codes]
  // ==========================================
  async getAllAccessCodes() {
    return this.requestApi('get', 'access-codes');
  }

  async createAccessCode(data: CreateAccessCodeDto) {
    return this.requestApi('post', 'access-codes', data);
  }

  async updateAccessCode(compid: string, data: UpdateAccessCodeDto) {
    return this.requestApi('patch', `access-codes/${compid}`, data);
  }

  async deleteAccessCode(compid: string) {
    return this.requestApi('delete', `access-codes/${compid}`);
  }

  // ==========================================
  // [Guest Management]
  // ==========================================
  async getAllGuests() {
    return this.requestApi('get', 'guests');
  }

  async addGuest(data: CreateGuestDto) {
    return this.requestApi('post', 'guests', data);
  }

  async deleteGuest(loginId: string) {
    return this.requestApi('delete', `guests/${loginId}`);
  }

  async getGuestRequests() {
    return this.requestApi('get', 'guest-requests');
  }

  async approveGuestRequest(data: ApproveGuestRequestDto) {
    return this.requestApi('post', 'guest-requests/approve', data);
  }

  async rejectGuestRequest(data: RejectGuestRequestDto) {
    return this.requestApi('post', 'guest-requests/reject', data);
  }

  // ==========================================
  // [Infra] Error Severity
  // ==========================================
  async getSeverities() {
    return this.requestApi('get', 'severities');
  }

  async createSeverity(data: CreateSeverityDto) {
    return this.requestApi('post', 'severities', data);
  }

  async updateSeverity(errorId: string, data: UpdateSeverityDto) {
    return this.requestApi(
      'patch',
      `severities/${encodeURIComponent(errorId)}`,
      data,
    );
  }

  async deleteSeverity(errorId: string) {
    return this.requestApi(
      'delete',
      `severities/${encodeURIComponent(errorId)}`,
    );
  }

  // ==========================================
  // [Infra] Metrics
  // ==========================================
  async getMetrics() {
    return this.requestApi('get', 'metrics');
  }

  async createMetric(data: CreateMetricDto) {
    return this.requestApi('post', 'metrics', data);
  }

  async updateMetric(metricName: string, data: UpdateMetricDto) {
    return this.requestApi(
      'patch',
      `metrics/${encodeURIComponent(metricName)}`,
      data,
    );
  }

  async deleteMetric(metricName: string) {
    return this.requestApi(
      'delete',
      `metrics/${encodeURIComponent(metricName)}`,
    );
  }

  // ==========================================
  // [Equipments]
  // ==========================================
  async getRefEquipments() {
    return this.requestApi('get', 'ref-equipments');
  }

  // ==========================================
  // [System Config]
  // ==========================================
  async getNewServerConfig() {
    return this.requestApi('get', 'new-server');
  }

  async updateNewServerConfig(data: UpdateNewServerDto) {
    return this.requestApi('patch', 'new-server', data);
  }

  async getCfgServers() {
    return this.requestApi('get', 'cfg-servers');
  }

  async createCfgServer(data: CreateCfgServerDto) {
    return this.requestApi('post', 'cfg-servers', data);
  }

  async updateCfgServer(eqpid: string, data: UpdateCfgServerDto) {
    return this.requestApi('patch', `cfg-servers/${eqpid}`, data);
  }

  async deleteCfgServer(eqpid: string) {
    return this.requestApi('delete', `cfg-servers/${eqpid}`);
  }
}

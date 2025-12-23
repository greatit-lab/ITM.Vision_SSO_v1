// backend/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  // ParseIntPipe, // [삭제] 사용하지 않음
} from '@nestjs/common';
import { AdminService } from './admin.service';
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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // [User & Admin Management]
  // ==========================================
  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('admins')
  async getAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Post('admins')
  async addAdmin(@Body() body: CreateAdminDto) {
    return this.adminService.addAdmin(body);
  }

  @Delete('admins/:id')
  async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }

  // ==========================================
  // [Access Codes]
  // ==========================================
  @Get('access-codes')
  async getAccessCodes() {
    return this.adminService.getAllAccessCodes();
  }

  @Post('access-codes')
  async createAccessCode(@Body() body: CreateAccessCodeDto) {
    return this.adminService.createAccessCode(body);
  }

  @Put('access-codes/:id')
  async updateAccessCode(
    @Param('id') id: string,
    @Body() body: UpdateAccessCodeDto,
  ) {
    return this.adminService.updateAccessCode(id, body);
  }

  @Delete('access-codes/:id')
  async deleteAccessCode(@Param('id') id: string) {
    return this.adminService.deleteAccessCode(id);
  }

  // ==========================================
  // [Guest Management]
  // ==========================================
  @Get('guests')
  async getGuests() {
    return this.adminService.getAllGuests();
  }

  @Post('guests')
  async addGuest(@Body() body: CreateGuestDto) {
    return this.adminService.addGuest(body);
  }

  @Delete('guests/:id')
  async deleteGuest(@Param('id') id: string) {
    return this.adminService.deleteGuest(id);
  }

  @Get('requests')
  async getGuestRequests() {
    return this.adminService.getGuestRequests();
  }

  @Post('requests/approve')
  async approveGuestRequest(@Body() body: ApproveGuestRequestDto) {
    return this.adminService.approveGuestRequest(body);
  }

  @Post('requests/reject')
  async rejectGuestRequest(@Body() body: RejectGuestRequestDto) {
    return this.adminService.rejectGuestRequest(body);
  }

  // ==========================================
  // [Infra Management] Error Severity Map
  // ==========================================
  @Get('severity')
  async getSeverities() {
    return this.adminService.getSeverities();
  }

  @Post('severity')
  async createSeverity(@Body() body: CreateSeverityDto) {
    return this.adminService.createSeverity(body);
  }

  @Put('severity/:errorId')
  async updateSeverity(
    @Param('errorId') errorId: string,
    @Body() body: UpdateSeverityDto,
  ) {
    return this.adminService.updateSeverity(errorId, body);
  }

  @Delete('severity/:errorId')
  async deleteSeverity(@Param('errorId') errorId: string) {
    return this.adminService.deleteSeverity(errorId);
  }

  // ==========================================
  // [Infra Management] Analysis Metrics
  // ==========================================
  @Get('metrics')
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  @Post('metrics')
  async createMetric(@Body() body: CreateMetricDto) {
    return this.adminService.createMetric(body);
  }

  @Put('metrics/:name')
  async updateMetric(
    @Param('name') name: string,
    @Body() body: UpdateMetricDto,
  ) {
    return this.adminService.updateMetric(name, body);
  }

  @Delete('metrics/:name')
  async deleteMetric(@Param('name') name: string) {
    return this.adminService.deleteMetric(name);
  }

  // ==========================================
  // [Equipments] Reference Data
  // ==========================================
  @Get('equipments')
  async getEquipments() {
    return this.adminService.getRefEquipments();
  }

  // ==========================================
  // [System Config] Server Configuration
  // ==========================================

  // 1. New Server Config (Single Row)
  @Get('new-server')
  async getNewServerConfig() {
    return this.adminService.getNewServerConfig();
  }

  @Put('new-server')
  async updateNewServerConfig(@Body() body: UpdateNewServerDto) {
    return this.adminService.updateNewServerConfig(body);
  }

  // 2. Cfg Server List (Agent Servers)
  @Get('servers')
  async getCfgServers() {
    return this.adminService.getCfgServers();
  }

  @Post('servers')
  async createCfgServer(@Body() body: CreateCfgServerDto) {
    return this.adminService.createCfgServer(body);
  }

  @Put('servers/:eqpid')
  async updateCfgServer(
    @Param('eqpid') eqpid: string,
    @Body() body: UpdateCfgServerDto,
  ) {
    return this.adminService.updateCfgServer(eqpid, body);
  }

  @Delete('servers/:eqpid')
  async deleteCfgServer(@Param('eqpid') eqpid: string) {
    return this.adminService.deleteCfgServer(eqpid);
  }
}

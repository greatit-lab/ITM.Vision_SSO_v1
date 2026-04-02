// backend/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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

  @Get('users') async getUsers() {
    return this.adminService.getAllUsers();
  }
  @Get('admins') async getAdmins() {
    return this.adminService.getAllAdmins();
  }
  @Post('admins') async addAdmin(@Body() body: CreateAdminDto) {
    return this.adminService.addAdmin(body);
  }
  @Delete('admins/:id') async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }

  // [수정됨] 접근 제어(Whitelist) 라우터 파라미터를 deptid로 변경
  @Get('access-codes') async getAccessCodes() {
    return this.adminService.getAllAccessCodes();
  }
  @Post('access-codes') async createAccessCode(
    @Body() body: CreateAccessCodeDto,
  ) {
    return this.adminService.createAccessCode(body);
  }
  @Put('access-codes/:deptid') async updateAccessCode(
    @Param('deptid') deptid: string,
    @Body() body: UpdateAccessCodeDto,
  ) {
    return this.adminService.updateAccessCode(deptid, body);
  }
  @Delete('access-codes/:deptid') async deleteAccessCode(
    @Param('deptid') deptid: string,
  ) {
    return this.adminService.deleteAccessCode(deptid);
  }

  @Get('guests') async getGuests() {
    return this.adminService.getAllGuests();
  }
  @Post('guests') async addGuest(@Body() body: CreateGuestDto) {
    return this.adminService.addGuest(body);
  }
  @Delete('guests/:id') async deleteGuest(@Param('id') id: string) {
    return this.adminService.deleteGuest(id);
  }

  @Get('requests') async getGuestRequests() {
    return this.adminService.getGuestRequests();
  }
  @Post('requests/approve') async approveGuestRequest(
    @Body() body: ApproveGuestRequestDto,
  ) {
    return this.adminService.approveGuestRequest(body);
  }
  @Post('requests/reject') async rejectGuestRequest(
    @Body() body: RejectGuestRequestDto,
  ) {
    return this.adminService.rejectGuestRequest(body);
  }

  @Get('severity') async getSeverities() {
    return this.adminService.getSeverities();
  }
  @Post('severity') async createSeverity(@Body() body: CreateSeverityDto) {
    return this.adminService.createSeverity(body);
  }
  @Put('severity/:errorId') async updateSeverity(
    @Param('errorId') errorId: string,
    @Body() body: UpdateSeverityDto,
  ) {
    return this.adminService.updateSeverity(errorId, body);
  }
  @Delete('severity/:errorId') async deleteSeverity(
    @Param('errorId') errorId: string,
  ) {
    return this.adminService.deleteSeverity(errorId);
  }

  @Get('metrics') async getMetrics() {
    return this.adminService.getMetrics();
  }
  @Post('metrics') async createMetric(@Body() body: CreateMetricDto) {
    return this.adminService.createMetric(body);
  }
  @Put('metrics/:name') async updateMetric(
    @Param('name') name: string,
    @Body() body: UpdateMetricDto,
  ) {
    return this.adminService.updateMetric(name, body);
  }
  @Delete('metrics/:name') async deleteMetric(@Param('name') name: string) {
    return this.adminService.deleteMetric(name);
  }

  @Get('equipments') async getEquipments() {
    return this.adminService.getRefEquipments();
  }

  @Get('new-server') async getNewServerConfig() {
    return this.adminService.getNewServerConfig();
  }
  @Put('new-server') async updateNewServerConfig(
    @Body() body: UpdateNewServerDto,
  ) {
    return this.adminService.updateNewServerConfig(body);
  }
  @Get('servers') async getCfgServers() {
    return this.adminService.getCfgServers();
  }
  @Post('servers') async createCfgServer(@Body() body: CreateCfgServerDto) {
    return this.adminService.createCfgServer(body);
  }
  @Put('servers/:eqpid') async updateCfgServer(
    @Param('eqpid') eqpid: string,
    @Body() body: UpdateCfgServerDto,
  ) {
    return this.adminService.updateCfgServer(eqpid, body);
  }
  @Delete('servers/:eqpid') async deleteCfgServer(
    @Param('eqpid') eqpid: string,
  ) {
    return this.adminService.deleteCfgServer(eqpid);
  }

  @Post('access-log')
  async logAccess(
    @Body() body: { loginId: string; menuName: string; accessUrl: string },
  ) {
    return this.adminService.logAccess(body);
  }

  @Get('usage-analytics')
  async getUsageAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.getUsageAnalytics(startDate, endDate);
  }

  // [신규 추가] 프론트엔드(http)의 요청을 받아 Service로 넘김
  @Get('storage-usage')
  async getStorageUsage(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval: 'daily' | 'monthly' = 'daily',
  ) {
    return this.adminService.getStorageUsage(startDate, endDate, interval);
  }

  // [신규 추가] 수동 동기화 Proxy
  @Post('storage-sync')
  async syncStorageNow() {
    return this.adminService.syncStorageNow();
  }
}

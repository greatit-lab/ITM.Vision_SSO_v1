// backend/src/equipment/equipment.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

// [중요] Controller 경로가 'Equipment' (대문자)로 설정되어 있습니다.
@Controller('Equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // [추가] 인프라 관리용 장비 목록 조회 엔드포인트 추가
  // 프론트엔드 요청 경로: /api/Equipment/infra
  @Get('infra')
  async getInfraList() {
    return this.equipmentService.getInfraList();
  }

  @Get('details')
  async getDetails(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
    @Query('eqpId') eqpId?: string,
  ) {
    return this.equipmentService.getDetails(site, sdwt, eqpId);
  }

  @Get('ids')
  async getEqpIds(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
    @Query('type') type?: string,
  ) {
    return this.equipmentService.getEqpIds(site, sdwt, type);
  }
}

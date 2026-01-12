// backend/src/equipment/equipment.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  EquipmentService,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // 1. 인프라 관리용 단순 목록 조회 (RefEquipment Only)
  @Get()
  async getInfraList() {
    return await this.equipmentService.getInfraList();
  }

  // 2. 장비 상세 조회 (Join Logic)
  @Get('details')
  async getDetails(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
    @Query('eqpId') eqpId?: string,
  ) {
    return await this.equipmentService.getDetails(site, sdwt, eqpId);
  }

  // 3. 장비 ID 목록 조회
  @Get('ids')
  async getEqpIds(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
    @Query('type') type?: string,
  ) {
    return await this.equipmentService.getEqpIds(site, sdwt, type);
  }

  // 4. 단일 조회 (PK 기준)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.equipmentService.findOne(id);
  }

  // 5. 생성 [변경: 타입 수정]
  @Post()
  async create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return await this.equipmentService.create(createEquipmentDto);
  }

  // 6. 수정 [변경: 타입 수정]
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return await this.equipmentService.update(id, updateEquipmentDto);
  }

  // 7. 삭제
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.equipmentService.remove(id);
  }
}

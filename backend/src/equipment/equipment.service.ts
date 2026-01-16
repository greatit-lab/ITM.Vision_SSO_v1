// backend/src/equipment/equipment.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// ==========================================
// [Type Definitions]
// Controller에서 참조하는 DTO 및 Interface를 이곳에서 관리
// ==========================================

export interface RefEquipment {
  eqpId: string;
  [key: string]: any;
}

export class CreateEquipmentDto {
  eqpId: string;
  [key: string]: any;
}

export class UpdateEquipmentDto {
  [key: string]: any;
}

export interface EquipmentDto {
  eqpId: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  lastContact: Date | string | null;
  os: string;
  systemType: string;
  timezone: string;
  macAddress: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  type: string;
  locale: string;
  systemModel: string;
  serialNum: string;
  application: string;
  version: string;
  dbVersion: string;
}

export interface EquipmentQueryParams {
  site?: string;
  sdwt?: string;
  eqpId?: string;
  type?: string;
}

@Injectable()
export class EquipmentService {
  // 생성자에 DataApiService 주입 (DB 직접 접근 X)
  constructor(private readonly dataApiService: DataApiService) {}

  /**
   * 도메인: 'equipment'
   * 모든 요청은 DataApiService를 통해 8081 포트의 Data API로 위임됩니다.
   */

  // 1. 인프라 목록 조회
  async getInfraList(): Promise<RefEquipment[]> {
    // Data API Controller: @Get() -> Path: /equipment
    const result = await this.dataApiService.request<RefEquipment[]>(
      'equipment', 
      'get',
      '', // 빈 문자열 (루트 경로)
    );
    return result || []; 
  }

  // 2. 장비 상세 조회 (Explorer 등)
  async getDetails(
    site?: string,
    sdwt?: string,
    eqpId?: string,
  ): Promise<EquipmentDto[]> {
    const params: EquipmentQueryParams = { site, sdwt, eqpId };
    
    // Data API Controller: @Get('details') -> Path: /equipment/details
    const result = await this.dataApiService.request<EquipmentDto[]>(
      'equipment',
      'get',
      'details',
      undefined, 
      params,    
    );
    return result || [];
  }

  // 3. 장비 ID 목록 조회
  async getEqpIds(
    site?: string,
    sdwt?: string,
    type?: string,
  ): Promise<string[]> {
    const params: EquipmentQueryParams = { site, sdwt, type };

    // Data API Controller: @Get('ids') -> Path: /equipment/ids
    const result = await this.dataApiService.request<string[]>(
      'equipment',
      'get',
      'ids',
      undefined,
      params,
    );
    return result || [];
  }

  // 4. 단일 장비 조회
  async findOne(eqpId: string): Promise<RefEquipment | null> {
    // Data API Controller: @Get(':id') -> Path: /equipment/:id
    return this.dataApiService.request<RefEquipment | null>(
      'equipment',
      'get',
      eqpId,
      undefined,
      undefined,
      { returnNullOn404: true }, // 404 발생 시 에러 대신 null 반환
    );
  }

  // 5. 장비 추가
  async create(data: CreateEquipmentDto): Promise<RefEquipment | null> {
    // Data API Controller: @Post() -> Path: /equipment
    return this.dataApiService.request<RefEquipment>(
      'equipment',
      'post',
      '',
      data,
    );
  }

  // 6. 장비 수정
  async update(
    eqpId: string,
    data: UpdateEquipmentDto,
  ): Promise<RefEquipment | null> {
    // Data API Controller: @Patch(':id') -> Path: /equipment/:id
    return this.dataApiService.request<RefEquipment>(
      'equipment',
      'patch',
      eqpId,
      data,
    );
  }

  // 7. 장비 삭제
  async remove(eqpId: string): Promise<RefEquipment | null> {
    // Data API Controller: @Delete(':id') -> Path: /equipment/:id
    return this.dataApiService.request<RefEquipment>(
      'equipment',
      'delete',
      eqpId,
    );
  }
}

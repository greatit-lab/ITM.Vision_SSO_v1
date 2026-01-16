// backend/src/equipment/equipment.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// Interface 정의 (Frontend와 공유되는 데이터 구조)
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
  constructor(private readonly dataApiService: DataApiService) {}

  // 1. 인프라 목록 조회
  async getInfraList(): Promise<RefEquipment[]> {
    // 8081 Data API 호출
    const result = await this.dataApiService.request<RefEquipment[]>(
      'equipment', 
      'get',
      '', 
    );
    return result || []; 
  }

  // 2. 장비 상세 조회
  async getDetails(
    site?: string,
    sdwt?: string,
    eqpId?: string,
  ): Promise<EquipmentDto[]> {
    const params: EquipmentQueryParams = { site, sdwt, eqpId };
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
    return this.dataApiService.request<RefEquipment | null>(
      'equipment',
      'get',
      eqpId,
      undefined,
      undefined,
      { returnNullOn404: true },
    );
  }

  // 5. 장비 추가
  async create(data: CreateEquipmentDto): Promise<RefEquipment | null> {
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
    return this.dataApiService.request<RefEquipment>(
      'equipment',
      'patch',
      eqpId,
      data,
    );
  }

  // 7. 장비 삭제
  async remove(eqpId: string): Promise<RefEquipment | null> {
    return this.dataApiService.request<RefEquipment>(
      'equipment',
      'delete',
      eqpId,
    );
  }
}

// backend/src/equipment/equipment.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [유지] Interface 및 DTO 정의
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
  // 생성자에 DataApiService 주입 (HttpService, ConfigService 직접 사용 X)
  constructor(private readonly dataApiService: DataApiService) {}

  /**
   * 도메인: 'equipment'
   * 모든 요청은 DataApiService를 통해 8081 포트의 Data API로 위임됩니다.
   */

  async getInfraList(): Promise<RefEquipment[]> {
    // [수정 완료] 기존 'infra' -> '' (빈 문자열)로 변경
    // Data API의 Controller가 @Get() (루트)로 매핑되어 있기 때문입니다.
    const result = await this.dataApiService.request<RefEquipment[]>(
      'equipment', 
      'get',
      '', 
    );
    return result || []; 
  }

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

  async create(data: CreateEquipmentDto): Promise<RefEquipment | null> {
    return this.dataApiService.request<RefEquipment>(
      'equipment',
      'post',
      '',
      data,
    );
  }

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

  async remove(eqpId: string): Promise<RefEquipment | null> {
    return this.dataApiService.request<RefEquipment>(
      'equipment',
      'delete',
      eqpId,
    );
  }
}

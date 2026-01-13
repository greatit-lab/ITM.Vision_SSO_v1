// backend/src/infra/infra.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// [유지] Interface 및 DTO 정의
// (기존 타입을 그대로 유지하여 다른 코드와의 호환성을 지킵니다)
export interface RefSdwt {
  sdwt: string;
  site: string;
  [key: string]: any;
}

export class CreateSdwtDto {
  sdwt: string;
  site: string;
  [key: string]: any;
}

export class UpdateSdwtDto {
  [key: string]: any;
}

export interface CfgServer {
  id?: number | string;
  eqpid?: string;
  [key: string]: any;
}

export class CreateCfgServerDto {
  eqpid?: string;
  [key: string]: any;
}

export class UpdateCfgServerDto {
  [key: string]: any;
}

@Injectable()
export class InfraService {
  // Domain 정의 (Data API의 controller 경로와 일치)
  private readonly DOMAIN = 'infra';

  constructor(private readonly dataApiService: DataApiService) {}

  // ==========================================
  // 1. SDWT (ref_sdwt)
  // ==========================================

  async getSdwts(): Promise<RefSdwt[]> {
    const result = await this.dataApiService.request<RefSdwt[]>(
      this.DOMAIN,
      'get',
      'sdwt',
    );
    return result || []; // null 반환 시 빈 배열로 안전 처리
  }

  async createSdwt(data: CreateSdwtDto): Promise<RefSdwt | null> {
    return this.dataApiService.request<RefSdwt>(
      this.DOMAIN,
      'post',
      'sdwt',
      data, // Request Body
    );
  }

  async updateSdwt(id: string, data: UpdateSdwtDto): Promise<RefSdwt | null> {
    return this.dataApiService.request<RefSdwt>(
      this.DOMAIN,
      'patch',
      `sdwt/${id}`, // Endpoint에 ID 포함
      data,
    );
  }

  async deleteSdwt(id: string): Promise<RefSdwt | null> {
    return this.dataApiService.request<RefSdwt>(
      this.DOMAIN,
      'delete',
      `sdwt/${id}`,
    );
  }

  // ==========================================
  // 2. Agent Server Config (cfg_server)
  // ==========================================

  async getAgentServers(): Promise<CfgServer[]> {
    const result = await this.dataApiService.request<CfgServer[]>(
      this.DOMAIN,
      'get',
      'server',
    );
    return result || [];
  }

  async createAgentServer(data: CreateCfgServerDto): Promise<CfgServer | null> {
    return this.dataApiService.request<CfgServer>(
      this.DOMAIN,
      'post',
      'server',
      data,
    );
  }

  async updateAgentServer(
    eqpid: string,
    data: UpdateCfgServerDto,
  ): Promise<CfgServer | null> {
    return this.dataApiService.request<CfgServer>(
      this.DOMAIN,
      'patch',
      `server/${eqpid}`,
      data,
    );
  }

  async deleteAgentServer(eqpid: string): Promise<CfgServer | null> {
    return this.dataApiService.request<CfgServer>(
      this.DOMAIN,
      'delete',
      `server/${eqpid}`,
    );
  }
}

// backend/src/infra/infra.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

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
  // Domain 정의
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
    return result || [];
  }

  async createSdwt(data: CreateSdwtDto): Promise<RefSdwt | null> {
    return this.dataApiService.request<RefSdwt>(
      this.DOMAIN,
      'post',
      'sdwt',
      data, 
    );
  }

  async updateSdwt(id: string, data: UpdateSdwtDto): Promise<RefSdwt | null> {
    // [수정 완료] Data API가 @Put으로 정의되어 있으므로 'patch' -> 'put'으로 변경
    return this.dataApiService.request<RefSdwt>(
      this.DOMAIN,
      'put', 
      `sdwt/${id}`, 
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

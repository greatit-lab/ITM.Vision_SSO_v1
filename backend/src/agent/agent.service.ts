// backend/src/agent/agent.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// 1. Agent 버전 데이터 구조 정의 (용량 필드 및 프록시 버전 필드 추가)
export interface AgentVersionDto {
  id: number;
  version: string;
  releaseDate: string | Date;
  isLatest: string;
  features: string;
  fileUrl64: string | null;
  fileSize64: string | null;
  fileUrlLegacy: string | null;
  fileSizeLegacy: string | null;
  fileUrlProxy: string | null;     // [추가됨] Proxy 전용 유틸리티 URL
  fileSizeProxy: string | null;    // [추가됨] Proxy 전용 유틸리티 용량
  proxyVersion: string | null;     // [추가됨] Proxy 전용 유틸리티 버전
  is_visible_y: string;            // [추가됨] 버전 노출 여부 제어
}

// 2. Agent 플러그인 데이터 구조 정의
export interface AgentPluginDto {
  id: string;
  name: string;
  version: string;
  description: string;
  filename: string;
  icon: string;
  color: string;
  bg: string;
}

@Injectable()
export class AgentService {
  constructor(private readonly dataApi: DataApiService) {}

  async getVersions(): Promise<AgentVersionDto[]> {
    const result: AgentVersionDto[] | null = await this.dataApi.request<AgentVersionDto[]>('agent', 'get', 'versions');
    return result ?? []; 
  }

  async getPlugins(): Promise<AgentPluginDto[]> {
    const result: AgentPluginDto[] | null = await this.dataApi.request<AgentPluginDto[]>('agent', 'get', 'plugins');
    return result ?? []; 
  }
}

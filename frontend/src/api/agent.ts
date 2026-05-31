// frontend/src/api/agent.ts
import http from './http';

// 1. Agent 버전 정보 인터페이스 (Proxy 용량/경로/버전 필드 추가)
export interface AgentVersion {
  id: number;
  version: string;
  releaseDate: string;
  isLatest: string;
  features: string;
  fileUrl64: string | null;
  fileSize64: string | null;
  fileUrlLegacy: string | null;
  fileSizeLegacy: string | null;
  fileUrlProxy?: string | null;  // Proxy 전용 유틸리티 다운로드 URL
  fileSizeProxy?: string | null; // Proxy 전용 유틸리티 파일 용량
  proxyVersion?: string | null;  // [추가됨] Proxy 전용 유틸리티 버전
  is_visible_y?: string;
}

// 2. Agent 플러그인 정보 인터페이스
export interface AgentPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  filename: string;
  icon: string;
  color: string;
  bg: string;
}

export const agentApi = {
  getVersions: async (): Promise<AgentVersion[]> => {
    const res = await http.get('/agent/versions');
    return res.data;
  },

  getPlugins: async (): Promise<AgentPlugin[]> => {
    const res = await http.get('/agent/plugins');
    return res.data;
  }
};

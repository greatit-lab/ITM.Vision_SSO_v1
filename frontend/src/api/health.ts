// frontend/src/api/health.ts
import http from "./http";

export interface EquipmentHealthDto {
  eqpId: string;
  totalScore: number;
  status: "Good" | "Warning" | "Critical";
  factors: {
    reliability: number;
    performance: number;
    component: number;
    stability: number;
    optical: number; // [추가] 백엔드 연동
  };
  details: {
    errorCount: number;
    avgResourceUsage: number;
    lampUsageRatio: number;
    tempVolatility: number;
    avgIntensity: number; // [추가]
    snrValue: number;     // [추가]
  };
}

export const healthApi = {
  getSummary: async (site: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await http.get<EquipmentHealthDto[]>("/Health/summary", { params });
    return data;
  },
};

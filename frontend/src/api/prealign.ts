// frontend/src/api/prealign.ts
import http from "./http";

export interface PreAlignDataDto {
  timestamp: string;
  xmm: number;
  ymm: number;
  notch: number;
}

export const preAlignApi = {
  getData: async (eqpId: string, startDate: string, endDate: string) => {
    const params = { eqpid: eqpId, startDate, endDate };
    // [수정] apiClient -> http
    const { data } = await http.get<PreAlignDataDto[]>(
      "/PreAlignAnalytics/data",
      { params }
    );
    return data;
  },
};

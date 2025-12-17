// frontend/src/api/lamp.ts
import http from "./http";

export interface LampLifeDto {
  eqpId: string;
  lampId: string;
  ageHour: number;
  lifespanHour: number;
  lastChanged: string | null;
  ts: string;
}

export const lampApi = {
  getData: async (site: string, sdwt?: string, eqpId?: string) => {
    const params = { site, sdwt, eqpId };
    // [수정] apiClient -> http
    const { data } = await http.get<LampLifeDto[]>("/LampLife", {
      params,
    });
    return data;
  },
};

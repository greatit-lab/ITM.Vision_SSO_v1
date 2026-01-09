// frontend/src/api/wafer.ts
import http from "./http";

export interface WaferQueryParams {
  eqpId?: string;
  lotId?: string;
  waferId?: string | number;
  startDate?: string | Date;
  endDate?: string | Date;
  cassetteRcp?: string;
  stageRcp?: string;
  stageGroup?: string;
  film?: string;
  page?: number;
  pageSize?: number;
  servTs?: string | Date;
  ts?: string | Date;
  dateTime?: string | Date;
  pointNumber?: string | number;
  pointId?: string;
  waferIds?: string;
  metric?: string;
  site?: string;
  sdwt?: string;
  targetEqps?: string;
}

export const waferApi = {
  getDistinctValues: async (field: string, params: WaferQueryParams) => {
    const { data } = await http.get<string[]>("/wafer/distinct-values", {
      params: { ...params, field },
    });
    return data;
  },

  getDistinctPoints: async (params: WaferQueryParams) => {
    const { data } = await http.get<string[]>("/wafer/distinct-points", {
      params,
    });
    return data;
  },

  getSpectrumTrend: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/spectrum-trend", { params });
    return data;
  },

  getSpectrumGen: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/spectrum-gen", { params });
    return data;
  },

  getFlatData: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/flat-data", { params });
    return data;
  },

  getPdfImage: async (params: WaferQueryParams) => {
    const { data } = await http.get<{ image: string }>("/wafer/pdf-image", {
      params,
    });
    return data;
  },

  checkPdf: async (params: WaferQueryParams) => {
    // [수정] Proxy 객체를 제거하고 필요한 필드만 순수 객체로 추출하여 전달 (오류 해결)
    const cleanParams = {
      eqpId: params.eqpId,
      lotId: params.lotId,
      waferId: params.waferId,
      servTs: params.servTs,
      dateTime: params.dateTime,
    };
    const { data } = await http.get<{ exists: boolean; url: string | null }>(
      "/wafer/check-pdf",
      { params: cleanParams }
    );
    return data;
  },

  getSpectrum: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/spectrum", { params });
    return data;
  },

  getStatistics: async (params: WaferQueryParams) => {
    // [수정] 통계 API 호출 시에도 안전하게 파라미터 전달
    const cleanParams = {
      eqpId: params.eqpId,
      lotId: params.lotId,
      waferId: params.waferId,
      servTs: params.servTs,
      cassettercp: params.cassetteRcp,
      stagercp: params.stageRcp,
      stagegroup: params.stageGroup,
      film: params.film,
    };
    const { data } = await http.get("/wafer/statistics", {
      params: cleanParams,
    });
    return data;
  },

  getPointData: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/point-data", { params });
    return data;
  },

  getResidualMap: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/residual-map", { params });
    return data;
  },

  getGoldenSpectrum: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/golden-spectrum", { params });
    return data;
  },

  getAvailableMetrics: async (params: WaferQueryParams) => {
    const { data } = await http.get<string[]>("/wafer/available-metrics", {
      params,
    });
    return data;
  },

  getLotUniformityTrend: async (metric: string, params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/lot-uniformity-trend", {
      params: { ...params, metric },
    });
    return data;
  },

  getMatchingEquipments: async (params: WaferQueryParams) => {
    const { data } = await http.get<string[]>("/wafer/matching-equipments", {
      params,
    });
    return data;
  },

  getComparisonData: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/comparison-data", { params });
    return data;
  },

  getOpticalTrend: async (params: WaferQueryParams) => {
    const { data } = await http.get("/wafer/optical-trend", { params });
    return data;
  },
};

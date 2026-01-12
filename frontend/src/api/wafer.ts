// frontend/src/api/wafer.ts
import http from "./http";

export interface WaferFlatDataDto {
  eqpId: string;
  lotId: string;
  waferId: number;
  servTs: string;
  dateTime: string;
  cassetteRcp: string;
  stageRcp: string;
  stageGroup: string;
  film: string;
}

export interface StatisticItem {
  max: number;
  min: number;
  range: number;
  mean: number;
  stdDev: number;
  percentStdDev: number;
  percentNonU: number;
}

export interface StatisticsDto {
  t1: StatisticItem;
  gof: StatisticItem;
  z: StatisticItem;
  srvisz: StatisticItem;
}

export interface PointDataResponseDto {
  headers: string[];
  data: (string | number | null)[][];
}

export interface SpectrumDataDto {
  class: string;
  wavelengths: number[];
  values: number[];
}

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
    const { data } = await http.get<{ totalItems: number; items: WaferFlatDataDto[] }>("/wafer/flat-data", { params });
    return data;
  },

  getPdfImage: async (params: WaferQueryParams) => {
    const cleanParams = {
        eqpId: params.eqpId,
        lotId: params.lotId,
        waferId: params.waferId,
        dateTime: params.dateTime, // [중요] PDF 이미지 조회 시 dateTime 포함
        pointNumber: params.pointNumber
    };
    const { data } = await http.get<{ image: string }>("/wafer/pdf-image", {
      params: cleanParams,
    });
    return data;
  },

  checkPdf: async (params: WaferQueryParams) => {
    const cleanParams = {
      eqpId: params.eqpId,
      lotId: params.lotId,
      waferId: params.waferId,
      servTs: params.servTs,
      dateTime: params.dateTime, // [중요] dateTime 포함
    };
    const { data } = await http.get<{ exists: boolean; url: string | null }>(
      "/wafer/check-pdf",
      { params: cleanParams }
    );
    return data;
  },

  getSpectrum: async (params: WaferQueryParams) => {
    const { data } = await http.get<SpectrumDataDto[]>("/wafer/spectrum", { params });
    return data;
  },

  getStatistics: async (params: WaferQueryParams) => {
    // [문제 해결] 통계 조회 시 0값이 나오는 원인: dateTime이 누락되어 백엔드에서 정확한 데이터를 찾지 못함.
    // 따라서 dateTime을 반드시 포함하여 전송합니다.
    const cleanParams = {
      eqpId: params.eqpId,
      lotId: params.lotId,
      waferId: params.waferId,
      servTs: params.servTs,
      dateTime: params.dateTime, // [필수] 장비 측정 시간 기준 조회
      cassetteRcp: params.cassetteRcp,
      stageRcp: params.stageRcp,
      stageGroup: params.stageGroup,
      film: params.film,
    };
    const { data } = await http.get<StatisticsDto>("/wafer/statistics", {
      params: cleanParams,
    });
    return data;
  },

  getPointData: async (params: WaferQueryParams) => {
    const cleanParams = {
      ...params,
      dateTime: params.dateTime // Point 조회 시에도 dateTime 사용
    };
    const { data } = await http.get<PointDataResponseDto>("/wafer/point-data", { params: cleanParams });
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

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
  // [추가] 데이터 존재 여부 플래그
  hasWaferMap?: boolean;
  hasSpectrum?: boolean;
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

export interface LotUniformityPointDto {
  point: number;
  value: number | null; // null 가능성 명시
  x: number;
  y: number;
  dieRow: number | null;
  dieCol: number | null;
}

export interface LotUniformitySeriesDto {
  waferId: number;
  dataPoints: LotUniformityPointDto[];
}

export interface OpticalTrendDto {
  ts: string;
  lotId: string;
  waferId: string;
  point: number;
  totalIntensity: number;
  peakIntensity: number;
  peakWavelength: number;
  darkNoise: number;
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
        dateTime: params.dateTime,
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
      dateTime: params.dateTime,
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
    const cleanParams = {
      eqpId: params.eqpId,
      lotId: params.lotId,
      waferId: params.waferId,
      servTs: params.servTs,
      dateTime: params.dateTime,
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
      dateTime: params.dateTime
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

  getLotUniformityTrend: async (params: WaferQueryParams) => {
    const { data } = await http.get<LotUniformitySeriesDto[]>("/wafer/lot-uniformity-trend", {
      params,
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
    const { data } = await http.get<OpticalTrendDto[]>("/wafer/optical-trend", { params });
    return data;
  },
};

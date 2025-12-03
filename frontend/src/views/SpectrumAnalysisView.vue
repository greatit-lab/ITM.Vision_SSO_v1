<!-- frontend/src/views/SpectrumAnalysisView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i class="text-lg text-violet-600 pi pi-bolt dark:text-violet-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Spectrum Analytics
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Advanced Fault Detection & Fingerprint Analysis
        </span>
      </div>
    </div>

    <div
      class="mb-4 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm transition-colors duration-300 shrink-0"
    >
      <div
        class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filter.site }"
            @change="onSiteChange"
          />
        </div>

        <div class="min-w-[180px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            showClear
            :disabled="!filter.site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filter.sdwt }"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0 relative group">
          <AutoComplete
            v-model="filter.eqpId"
            :suggestions="filteredEqpIds"
            @complete="searchEqp"
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            dropdown
            class="w-full custom-dropdown small"
            inputClass="custom-input-text small !pr-7"
            panelClass="custom-dropdown-panel small"
            @item-select="loadLots"
          />
          <i
            v-if="filter.eqpId"
            @click="
              filter.eqpId = '';
              lotIds = [];
              waferIds = [];
            "
            class="pi pi-times absolute right-8 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer z-10 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
          ></i>
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.lotId"
            :options="lotIds"
            placeholder="Lot ID"
            showClear
            :disabled="!filter.eqpId"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filter.lotId }"
            @change="loadWafers"
          />
        </div>

        <div class="min-w-[100px] shrink-0">
          <Select
            v-model="filter.waferId"
            :options="waferIds"
            placeholder="Wafer"
            showClear
            :disabled="!filter.lotId"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filter.waferId }"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-violet-600 !border-violet-600 hover:!bg-violet-700 !w-8 !h-8 !text-xs"
          @click="analyze"
          :loading="isLoading"
          :disabled="!filter.waferId"
        />
      </div>
    </div>

    <div
      v-if="hasAnalyzed"
      class="flex flex-1 min-h-0 gap-4 pb-4 overflow-hidden 2xl:flex-row fade-in"
    >
      <div
        class="flex flex-col flex-1 w-full h-full overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
      >
        <div
          class="flex items-center justify-between p-3 border-b border-slate-100 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div class="flex items-center gap-2 pl-1">
            <div class="w-1 h-3 rounded-full bg-rose-500"></div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Simulation Fidelity Map
            </h3>
          </div>
          <span
            class="text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-800"
          >
            Residual Error
          </span>
        </div>
        <div class="relative flex-1">
          <EChart :option="heatmapOption" @chartCreated="onHeatmapCreated" />
          <div
            class="absolute p-2 text-xs rounded bottom-4 left-4 text-slate-400 bg-white/90 dark:bg-black/60 backdrop-blur-sm pointer-events-none border border-slate-100 dark:border-zinc-700"
          >
            <i class="mr-1 pi pi-info-circle"></i> Click a point to compare
            spectrum
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-1 w-full h-full overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
      >
        <div
          class="flex items-center justify-between p-3 border-b border-slate-100 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div class="flex items-center gap-2 pl-1">
            <div class="w-1 h-3 rounded-full bg-violet-500"></div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Spectrum Fingerprint
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="selectedPoint"
              class="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-zinc-700"
            >
              Pt #{{ selectedPoint }}
            </span>
          </div>
        </div>
        <div class="relative flex-1 p-2">
          <div
            v-if="!selectedPoint"
            class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60"
          >
            <i class="mb-2 text-4xl pi pi-chart-line opacity-20"></i>
            <span class="text-xs"
              >Select a point from the map to view details</span
            >
          </div>
          <EChart v-else :option="spectrumOption" />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] text-slate-400 opacity-50"
    >
      <div
        class="flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i class="text-3xl pi pi-search text-slate-300 dark:text-zinc-600"></i>
      </div>
      <p class="text-sm font-medium">Select filters and click Analyze.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import {
  waferApi,
  type WaferFlatDataDto,
  type ResidualMapDto,
} from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";

// PrimeVue Components
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";

// [수정] 차트 데이터용 로컬 인터페이스 정의
interface SpectrumChartItem {
  wavelength: number;
  value: number;
}

// State
const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  lotId: "",
  waferId: "",
});
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);
const lotIds = ref<string[]>([]);
const waferIds = ref<string[]>([]);

const isLoading = ref(false);
const hasAnalyzed = ref(false);
const selectedPoint = ref<number | null>(null);

// Data State - [수정] 명시적 타입 선언으로 'any' 문제 해결
const residualData = ref<ResidualMapDto[]>([]);
const currentSpectrum = ref<SpectrumChartItem[]>([]);
const goldenSpectrum = ref<SpectrumChartItem[]>([]);
const waferInfo = ref<WaferFlatDataDto | null>(null);

// --- Lifecycle & Filters ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();
});

const onSiteChange = async () => {
  sdwts.value = await dashboardApi.getSdwts(filter.site);
  eqpIds.value = [];
  filter.sdwt = "";
  filter.eqpId = "";
  filter.lotId = "";
  filter.waferId = "";
};
const onSdwtChange = async () => {
  eqpIds.value = await equipmentApi.getEqpIds(undefined, filter.sdwt);
  filter.eqpId = "";
  filter.lotId = "";
  filter.waferId = "";
};
const searchEqp = (e: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(e.query.toLowerCase())
  );
};
const loadLots = async () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  lotIds.value = await waferApi.getDistinctValues("lotids", {
    eqpId: filter.eqpId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });
  filter.lotId = "";
  filter.waferId = "";
};
const loadWafers = async () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  waferIds.value = await waferApi.getDistinctValues("waferids", {
    eqpId: filter.eqpId,
    lotId: filter.lotId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });
  filter.waferId = "";
};

// --- Analysis Logic ---
const analyze = async () => {
  if (!filter.waferId) return;
  isLoading.value = true;
  selectedPoint.value = null;

  try {
    const flatRes = await waferApi.getFlatData({
      eqpId: filter.eqpId,
      lotId: filter.lotId,
      waferId: filter.waferId,
      pageSize: 1,
    });

    // [수정] 방어적 코딩: items가 undefined일 경우 안전하게 처리
    const currentWafer = flatRes?.items?.[0] ?? null;

    if (!currentWafer) {
      throw new Error("Wafer not found");
    }

    waferInfo.value = currentWafer;

    // [타입 안전] currentWafer는 null이 아님이 보장됨
    const [residuals, golden] = await Promise.all([
      waferApi.getResidualMap({
        eqpId: filter.eqpId,
        lotId: filter.lotId,
        waferId: filter.waferId,
        ts: currentWafer.servTs,
      }),
      waferApi.getGoldenSpectrum({
        eqpId: filter.eqpId,
        cassetteRcp: currentWafer.cassetteRcp,
        stageGroup: currentWafer.stageGroup,
        film: currentWafer.film,
      }),
    ]);

    residualData.value = residuals ?? [];

    if (
      golden &&
      Array.isArray(golden.wavelengths) &&
      Array.isArray(golden.values)
    ) {
      goldenSpectrum.value = golden.wavelengths.map(
        (wl: number, i: number) => ({
          wavelength: wl,
          value: (golden.values[i] ?? 0) * 100,
        })
      );
    } else {
      goldenSpectrum.value = [];
    }

    hasAnalyzed.value = true;
  } catch (e) {
    console.error(e);
    residualData.value = [];
    goldenSpectrum.value = [];
  } finally {
    isLoading.value = false;
  }
};

// --- Chart Options ---
const heatmapOption = computed(() => {
  const rData = residualData.value || [];
  // [수정] d가 undefined일 가능성 차단 및 안전한 매핑
  const data = rData.map((d) => [
    d?.x ?? 0,
    d?.y ?? 0,
    d?.residual ?? 0,
    d?.point ?? 0,
  ]);

  // [수정] 오류 1 해결: 안전한 fallback 처리
  const maxVal =
    rData.length > 0
      ? Math.max(...rData.map((d) => Number(d?.residual ?? 0)))
      : 10;

  return {
    tooltip: {
      position: "top",
      formatter: (params: any) =>
        `Point: ${params.value[3]}<br>Error: ${params.value[2].toFixed(2)}`,
    },
    grid: { top: 10, bottom: 10, left: 10, right: 10 },
    xAxis: { type: "value", show: false, min: -150, max: 150 },
    yAxis: { type: "value", show: false, min: -150, max: 150 },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 10,
      inRange: { color: ["#3b82f6", "#fcd34d", "#ef4444"] },
    },
    series: [
      {
        type: "heatmap",
        data: data,
        itemStyle: { borderColor: "#fff", borderWidth: 1 },
        pointSize: 20,
      },
    ],
  };
});

const onHeatmapCreated = (chart: any) => {
  chart.on("click", async (params: any) => {
    if (params && params.value && params.value.length > 3) {
      const point = params.value[3];
      await loadPointSpectrum(point);
    }
  });
};

const loadPointSpectrum = async (point: number) => {
  const info = waferInfo.value;
  if (!info) return; // Guard Clause

  selectedPoint.value = point;

  // [수정] 오류 2 예방: API 호출
  const spec = await waferApi.getSpectrum({
    eqpId: filter.eqpId,
    lotId: filter.lotId,
    waferId: filter.waferId,
    ts: info.servTs,
    pointNumber: point,
  });

  // [수정] spec 배열 및 expObj 유효성 검사 강화
  if (!spec || !Array.isArray(spec)) {
    currentSpectrum.value = [];
    return;
  }

  const expObj = spec.find(
    (s: any) =>
      s &&
      s.class &&
      typeof s.class === "string" &&
      s.class.toLowerCase() === "exp"
  );

  if (
    expObj &&
    Array.isArray(expObj.wavelengths) &&
    Array.isArray(expObj.values)
  ) {
    currentSpectrum.value = expObj.wavelengths.map((wl: number, i: number) => ({
      wavelength: wl,
      value: (expObj.values[i] ?? 0) * 100, // 안전한 값 접근
    }));
  } else {
    currentSpectrum.value = [];
  }
};

const spectrumOption = computed(() => {
  // [수정] 오류 2 해결: 배열 요소가 undefined일 가능성 차단
  const currData = currentSpectrum.value || [];
  const goldData = goldenSpectrum.value || [];

  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Current (EXP)", "Golden Reference"], top: 0 },
    grid: { left: 50, right: 20, bottom: 40, top: 30 },
    xAxis: {
      type: "category",
      data: currData.map((d) => d?.wavelength ?? 0), // Safe map
      name: "Wavelength (nm)",
      nameLocation: "middle",
      nameGap: 25,
    },
    yAxis: {
      type: "value",
      name: "Reflectance (%)",
      nameLocation: "middle",
      nameGap: 35,
    },
    series: [
      {
        name: "Current (EXP)",
        type: "line",
        data: currData.map((d) => d?.value ?? 0), // Safe map
        showSymbol: false,
        lineStyle: { width: 2, color: "#f43f5e" },
      },
      {
        name: "Golden Reference",
        type: "line",
        data: goldData.map((d) => d?.value ?? 0), // Safe map
        showSymbol: false,
        lineStyle: { width: 2, type: "dashed", color: "#64748b" },
        z: 0,
      },
    ],
  };
});
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}
:deep(.custom-input-text.small) {
  @apply !text-[13px] !p-1 !h-7 !bg-transparent !border-0;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown),
:deep(.p-autocomplete-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg),
:deep(.p-autocomplete-dropdown svg) {
  @apply w-3 h-3;
}
</style>

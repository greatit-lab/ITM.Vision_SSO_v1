<!-- frontend/src/views/PerformanceTrendView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i class="text-lg text-teal-600 pi pi-bolt dark:text-teal-400"></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Performance Trend
          </h1>
          <span
            class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >
            System Resource Monitoring
          </span>
        </div>
      </div>

      <div
        v-if="isRealtime"
        class="flex items-center gap-2 px-3 py-1 transition-all border rounded-full bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/50 animate-pulse"
      >
        <span class="relative flex w-1.5 h-1.5">
          <span
            class="absolute inline-flex w-full h-full rounded-full opacity-75 bg-rose-400 animate-ping"
          ></span>
          <span
            class="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"
          ></span>
        </span>
        <span
          class="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider"
          >LIVE</span
        >
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm transition-colors duration-300 shrink-0"
    >
      <div
        class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filterStore.selectedSite"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSite }"
            :disabled="isRealtime"
            @change="onSiteChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filterStore.selectedSdwt"
            :options="sdwts"
            placeholder="SDWT"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSdwt }"
            :disabled="!filterStore.selectedSite || isRealtime"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="selectedEqpId"
            :options="eqpIds"
            filter
            resetFilterOnHide
            placeholder="Select EQP"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !selectedEqpId }"
            :disabled="!filterStore.selectedSdwt || isRealtime"
            :loading="isEqpLoading"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 mx-1 bg-slate-200 dark:bg-zinc-700 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="startDate"
            showTime
            hourFormat="24"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Time"
            class="w-full custom-dropdown small date-picker"
            :disabled="isRealtime"
            :stepMinute="60"
          />
        </div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="endDate"
            showTime
            hourFormat="24"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Time"
            class="w-full custom-dropdown small date-picker"
            :disabled="isRealtime"
            :stepMinute="60"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-2 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
      >
        <div class="flex items-center gap-1">
          <Button
            icon="pi pi-search"
            rounded
            class="!bg-teal-600 !border-teal-600 hover:!bg-teal-700 !w-8 !h-8 !text-xs"
            @click="() => searchData()"
            :disabled="!selectedEqpId || isRealtime || isLoading"
          />
          <Button
            icon="pi pi-refresh"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Reset'"
            class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
            @click="resetFilters"
            :disabled="isRealtime"
          />
        </div>

        <div class="w-px h-4 mx-1 bg-slate-200 dark:bg-zinc-700"></div>

        <div
          class="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-lg px-2 py-0.5 border border-slate-100 dark:border-zinc-800"
          :class="{ 'opacity-50 pointer-events-none': !selectedEqpId }"
        >
          <div
            class="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
          >
            <span>AUTO</span>
            <i class="pi pi-clock text-[9px]"></i>
          </div>
          <Select
            v-model="intervalSeconds"
            :options="intervalOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Off"
            class="w-[110px] h-6 !border-0 !bg-transparent !text-[11px] !shadow-none small-text-dropdown"
            :class="{ '!text-rose-500 font-bold': isRealtime }"
            overlayClass="custom-dropdown-panel small"
            @change="toggleRealtime"
            :disabled="!selectedEqpId"
          />
        </div>
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex flex-col flex-1 min-h-0 gap-3 pb-2 animate-fade-in relative"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl border border-transparent"
      >
        <div class="relative">
          <div
            class="w-12 h-12 border-4 rounded-full border-slate-100 dark:border-zinc-800"
          ></div>
          <div
            class="absolute top-0 left-0 w-12 h-12 border-4 rounded-full border-teal-500 border-t-transparent animate-spin"
          ></div>
        </div>
        <p class="mt-4 text-xs font-bold text-slate-500 animate-pulse">
          Analyzing Lot Data...
        </p>
      </div>

      <div
        class="grid flex-1 min-h-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:grid-rows-2"
      >
        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              <i class="text-blue-500 pi pi-desktop"></i> {{ selectedEqpId }} -
              CPU Usage
            </h3>
          </div>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="cpuOption"
              @chartCreated="(inst) => onChartInit('cpu', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-xs text-slate-400"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.cpu"
                @click="resetChartZoom('cpu')"
                class="absolute z-10 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-colors bg-blue-500 rounded shadow-md top-2 right-2 hover:bg-blue-600"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              <i class="pi pi-microchip text-emerald-500"></i>
              {{ selectedEqpId }} - Memory Usage
            </h3>
          </div>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="memOption"
              @chartCreated="(inst) => onChartInit('mem', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-xs text-slate-400"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.mem"
                @click="resetChartZoom('mem')"
                class="absolute z-10 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-colors rounded shadow-md top-2 right-2 bg-emerald-500 hover:bg-emerald-600"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              <i class="pi pi-cog text-amber-500"></i> {{ selectedEqpId }} - CPU
              Temp & Fan Speed
            </h3>
          </div>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="cpuTempFanOption"
              @chartCreated="(inst) => onChartInit('dual', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-xs text-slate-400"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.dual"
                @click="resetChartZoom('dual')"
                class="absolute z-10 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-colors rounded shadow-md top-2 right-2 bg-amber-500 hover:bg-amber-600"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              <i class="text-orange-500 pi pi-palette"></i>
              {{ selectedEqpId }} - GPU Temp
            </h3>
          </div>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="gpuOption"
              @chartCreated="(inst) => onChartInit('gpu', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-xs text-slate-400"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.gpu"
                @click="resetChartZoom('gpu')"
                class="absolute z-10 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-colors bg-orange-500 rounded shadow-md top-2 right-2 hover:bg-orange-600"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-auto shrink-0 flex flex-col"
      >
        <div
          class="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 shrink-0"
        >
          <i class="text-xs text-teal-500 pi pi-list"></i>
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
            Performance Summary (Peak Values)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table
            class="w-full text-xs text-left table-fixed text-slate-600 dark:text-slate-400"
          >
            <thead
              class="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800 dark:text-slate-400"
            >
              <tr>
                <th
                  scope="col"
                  class="px-4 py-2 w-[120px] text-left font-bold text-slate-600 dark:text-slate-300"
                >
                  EQP ID
                </th>
                <th scope="col" class="px-4 py-2 text-left">CPU Peak Time</th>
                <th scope="col" class="px-4 py-2 text-left">CPU Max (%)</th>
                <th scope="col" class="px-4 py-2 text-left">CPU Temp (°C)</th>
                <th scope="col" class="px-4 py-2 text-left">Fan (RPM)</th>
                <th scope="col" class="px-4 py-2 text-left">Mem Peak Time</th>
                <th scope="col" class="px-4 py-2 text-left">Mem Max (%)</th>
                <th scope="col" class="px-4 py-2 text-left">GPU Peak Time</th>
                <th scope="col" class="px-4 py-2 text-left">GPU Max (°C)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-for="item in summaryData"
                :key="item.eqpId"
                class="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/50"
              >
                <td
                  class="px-4 py-1.5 text-left font-bold text-slate-700 dark:text-slate-200"
                >
                  {{ item.eqpId }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ formatDate(item.cpuPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 text-left font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.cpuMax, 2) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ fmt(item.cpuTempAtPeak, 1) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ fmt(item.fanSpeedAtPeak, 0) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ formatDate(item.memPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 text-left font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.memMax, 2) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ formatDate(item.gpuPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 text-left font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.gpuMax, 1) }}
                </td>
              </tr>
              <tr v-if="summaryData.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-slate-400">
                  No Summary Data Available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] opacity-50 select-none"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i
          class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-chart-line"
        ></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Ready to analyze.</p>
      <p class="mt-1 text-xs text-slate-400">
        Select Equipment and Time Range to view performance trends.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive, watch } from "vue";
import { useFilterStore } from "@/stores/filter";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import {
  performanceApi,
  type PerformanceDataPointDto,
} from "@/api/performance";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";

// PrimeVue
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

interface PerformanceSummary {
  eqpId: string;
  cpuPeakTime?: string;
  cpuMax?: number;
  cpuTempAtPeak?: number;
  fanSpeedAtPeak?: number;
  memPeakTime?: string;
  memMax?: number;
  gpuPeakTime?: string;
  gpuMax?: number;
}

const filterStore = useFilterStore();
const authStore = useAuthStore();
const selectedEqpId = ref("");
const startDate = ref(new Date(Date.now() - 24 * 60 * 60 * 1000));
const endDate = ref(new Date());
const intervalSeconds = ref(0);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const isEqpLoading = ref(false);

const chartData = ref<PerformanceDataPointDto[]>([]);
const summaryData = ref<PerformanceSummary[]>([]);
const isLoading = ref(false);
const hasSearched = ref(false);
const isRealtime = ref(false);
let refreshTimer: number | null = null;

const zoomStates = reactive<Record<string, boolean>>({
  cpu: false,
  mem: false,
  dual: false,
  gpu: false,
});
const chartInstances = reactive<Record<string, ECharts | null>>({
  cpu: null,
  mem: null,
  dual: null,
  gpu: null,
});

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const intervalOptions = [
  { label: "Manual", value: 0 },
  { label: "10 Sec", value: 10 },
  { label: "1 Min", value: 60 },
  { label: "5 Min", value: 300 },
];

// [추가] 날짜 자동 보정 로직
watch(startDate, (newStart) => {
  if (newStart && endDate.value && newStart > endDate.value) {
    endDate.value = new Date(newStart);
  }
});

watch(endDate, (newEnd) => {
  if (newEnd && startDate.value && newEnd < startDate.value) {
    startDate.value = new Date(newEnd);
  }
});

// [핵심] 로컬 시간 ISO 문자열 변환 함수 (UTC 시차 -9시간 해결)
const toLocalISOString = (date: Date) => {
  if (!date) return "";
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - offset);
  return localDate.toISOString().slice(0, 19).replace('T', ' '); 
};

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();

  let targetSite = filterStore.selectedSite;
  let targetSdwt = filterStore.selectedSdwt;

  if (!targetSite) {
    targetSite = localStorage.getItem("performance_site") || "";
    if (targetSite) {
      targetSdwt = localStorage.getItem("performance_sdwt") || "";
    }
  }

  if (!targetSite) {
    targetSite = authStore.user?.site || "";
    targetSdwt = authStore.user?.sdwt || "";
  }

  if (targetSite && sites.value.includes(targetSite)) {
    filterStore.selectedSite = targetSite;

    sdwts.value = await dashboardApi.getSdwts(targetSite);

    if (targetSdwt && sdwts.value.includes(targetSdwt)) {
      filterStore.selectedSdwt = targetSdwt;

      await loadEqpIds();

      const savedEqpId = localStorage.getItem("performance_eqpid");
      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        selectedEqpId.value = savedEqpId;
      }
    } else {
      filterStore.selectedSdwt = "";
      selectedEqpId.value = "";
    }
  } else {
    filterStore.selectedSite = "";
    filterStore.selectedSdwt = "";
  }

  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDarkMode.value = document.documentElement.classList.contains("dark");
      }
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (themeObserver) themeObserver.disconnect();
});

// --- Handlers ---
const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("performance_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("performance_site");
    sdwts.value = [];
  }

  filterStore.selectedSdwt = "";
  localStorage.removeItem("performance_sdwt");
  selectedEqpId.value = "";
  localStorage.removeItem("performance_eqpid");
  eqpIds.value = [];
  hasSearched.value = false;
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("performance_sdwt", filterStore.selectedSdwt);
    await loadEqpIds();
  } else {
    localStorage.removeItem("performance_sdwt");
    eqpIds.value = [];
  }

  selectedEqpId.value = "";
  localStorage.removeItem("performance_eqpid");
  hasSearched.value = false;
};

const onEqpIdChange = () => {
  if (selectedEqpId.value) {
    localStorage.setItem("performance_eqpid", selectedEqpId.value);
  } else {
    localStorage.removeItem("performance_eqpid");
  }
  
  // [수정] EQP ID 변경 시 초기화
  hasSearched.value = false;
  chartData.value = [];
  summaryData.value = [];
};

const resetFilters = () => {
  if (isRealtime.value) return;

  filterStore.reset();
  selectedEqpId.value = "";

  localStorage.removeItem("performance_site");
  localStorage.removeItem("performance_sdwt");
  localStorage.removeItem("performance_eqpid");

  sdwts.value = [];
  eqpIds.value = [];
  chartData.value = [];
  summaryData.value = [];
  hasSearched.value = false;
  intervalSeconds.value = 0;
  
  // 날짜 초기화
  endDate.value = new Date();
  startDate.value = new Date(Date.now() - 24 * 60 * 60 * 1000);
};

const loadEqpIds = async () => {
  isEqpLoading.value = true;
  try {
    eqpIds.value = await equipmentApi.getEqpIds({
      site: filterStore.selectedSite || undefined,
      sdwt: filterStore.selectedSdwt,
      type: "performance", 
    });
  } catch (e) {
    console.error("Failed to load EQP IDs", e);
    eqpIds.value = [];
  } finally {
    isEqpLoading.value = false;
  }
};

// --- Chart Options & Helpers ---
const getTooltipFormatter = (unitMap: Record<string, string>) => {
  return (params: any) => {
    if (!params || !params[0]) return "";
    const xDate = new Date(params[0].axisValueLabel);
    const timeStr = isNaN(xDate.getTime())
      ? params[0].axisValueLabel
      : xDate.toLocaleTimeString("en-GB", { hour12: false });

    let html = `<div class="mb-1 font-bold">${timeStr}</div>`;

    params.forEach((p: any) => {
      let key = "";
      if (p.seriesName === "CPU Usage") key = "cpuUsage";
      else if (p.seriesName === "Memory Usage") key = "memoryUsage";
      else if (p.seriesName === "CPU Temp") key = "cpuTemp";
      else if (p.seriesName === "Fan Speed") key = "fanSpeed";
      else if (p.seriesName === "GPU Temp") key = "gpuTemp";

      if (key && p.data[key] !== undefined) {
        const u = unitMap[p.seriesName] || "";
        const valNum = Number(p.data[key]);
        const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
        html += `<div>${colorDot} ${p.seriesName}: ${valNum.toFixed(
          2
        )} ${u}</div>`;
      }
    });
    return html;
  };
};

const axisFormatter = (value: number | string) => {
  const val = Number(value);
  if (isNaN(val)) return value;
  return Number.isInteger(val) ? val : val.toFixed(1);
};

const getAxisRange = (
  field: keyof PerformanceDataPointDto,
  isPercent: boolean = false
) => {
  if (!chartData.value.length) return {};
  const values = chartData.value.map((d) => Number(d[field]));
  const min = Math.min(...values);
  const max = Math.max(...values);

  const range = max - min || (min === 0 ? 1 : Math.abs(min * 0.1));
  const padding = range * 0.2;

  let newMin = min - padding;
  let newMax = max + padding;

  if (isPercent) {
    newMin = Math.max(0, newMin);
    newMax = Math.min(100, newMax);
  } else {
    if (field === "fanSpeed") newMin = Math.max(0, newMin);
  }

  return { min: newMin, max: newMax };
};

const commonChartOption = () => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
    },
    grid: { left: 50, right: 35, top: 30, bottom: 25 },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0],
        filterMode: "filter",
      },
    ],
    dataset: {
      source: chartData.value,
    },
    xAxis: {
      type: "category",
      axisLabel: {
        color: textColor,
        fontSize: 10,
        formatter: (value: string) => {
          const d = new Date(value);
          if (isNaN(d.getTime())) return value;
          return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}`;
        },
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    legend: {
      show: false,
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLabel: { color: textColor, fontSize: 10, formatter: axisFormatter },
      splitLine: { lineStyle: { color: gridColor } },
    },
  };
};

const cpuOption = computed(() => {
  const base = commonChartOption();
  const range = getAxisRange("cpuUsage", true);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "CPU Usage": "%" }),
    },
    yAxis: {
      ...base.yAxis,
      min: range.min,
      max: range.max,
    },
    series: [
      {
        name: "CPU Usage",
        type: "line",
        encode: { x: "timestamp", y: "cpuUsage" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0)" },
            ],
          },
        },
      },
    ],
  };
});


const memOption = computed(() => {
  const base = commonChartOption();
  const range = getAxisRange("memoryUsage", true);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "Memory Usage": "%" }),
    },
    yAxis: {
      ...base.yAxis,
      min: range.min,
      max: range.max,
    },
    series: [
      {
        name: "Memory Usage",
        type: "line",
        encode: { x: "timestamp", y: "memoryUsage" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#10b981" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" },
            ],
          },
        },
      },
    ],
  };
});

const cpuTempFanOption = computed(() => {
  const base = commonChartOption();
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  const tempRange = getAxisRange("cpuTemp", false);
  const fanRange = getAxisRange("fanSpeed", false);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "CPU Temp": "°C", "Fan Speed": "RPM" }),
    },
    legend: {
      show: true,
      data: ["CPU Temp", "Fan Speed"],
      selectedMode: true,
      top: 5,
      right: 70,
      textStyle: { color: textColor, fontSize: 10 },
      itemGap: 10,
      itemWidth: 15,
      itemHeight: 10,
    },
    yAxis: [
      {
        type: "value",
        name: "Temp (°C)",
        position: "left",
        min: tempRange.min,
        max: tempRange.max,
        axisLabel: { color: textColor, fontSize: 10, formatter: axisFormatter },
        splitLine: { lineStyle: { color: gridColor } },
      },
      {
        type: "value",
        name: "Fan (RPM)",
        position: "right",
        min: fanRange.min,
        max: fanRange.max,
        axisLabel: { color: textColor, fontSize: 10, formatter: axisFormatter },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "CPU Temp",
        type: "line",
        yAxisIndex: 0,
        encode: { x: "timestamp", y: "cpuTemp" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#f59e0b" },
      },
      {
        name: "Fan Speed",
        type: "line",
        yAxisIndex: 1,
        encode: { x: "timestamp", y: "fanSpeed" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#8b5cf6" },
      },
    ],
  };
});

const gpuOption = computed(() => {
  const base = commonChartOption();
  const range = getAxisRange("gpuTemp", false);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "GPU Temp": "°C" }),
    },
    yAxis: {
      ...base.yAxis,
      min: range.min,
      max: range.max,
    },
    series: [
      {
        name: "GPU Temp",
        type: "line",
        encode: { x: "timestamp", y: "gpuTemp" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#ef4444" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.3)" },
              { offset: 1, color: "rgba(239, 68, 68, 0)" },
            ],
          },
        },
      },
    ],
  };
});

const onChartInit = (chartKey: string, instance: any) => {
  chartInstances[chartKey] = instance;
  instance.on("dataZoom", () => {
    const option = instance.getOption();
    if (option.dataZoom && option.dataZoom[0]) {
      const start = option.dataZoom[0].start;
      const end = option.dataZoom[0].end;
      if (start > 0 || end < 100) zoomStates[chartKey] = true;
      else zoomStates[chartKey] = false;
    }
  });
};

const resetChartZoom = (chartKey: string) => {
  const instance = chartInstances[chartKey];
  if (instance) {
    instance.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    zoomStates[chartKey] = false;
  }
};

const toggleRealtime = () => {
  if (intervalSeconds.value > 0) {
    isRealtime.value = true;
    updateRealtimeDates();
    searchData();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      updateRealtimeDates();
      searchData(true);
    }, intervalSeconds.value * 1000);
  } else {
    isRealtime.value = false;
    if (refreshTimer) clearInterval(refreshTimer);
  }
};

const updateRealtimeDates = () => {
  const now = new Date();
  endDate.value = now;
  startDate.value = new Date(now.getTime() - 1 * 60 * 60 * 1000);
};


const searchData = async (silent = false) => {
  if (!selectedEqpId.value) return;
  
  // [수정] 차트 영역을 먼저 보여주고, 로딩 오버레이 표시
  hasSearched.value = true;
  if (!silent) isLoading.value = true;

  // 데이터 초기화
  chartData.value = [];
  summaryData.value = [];

  try {
    const startStr = toLocalISOString(startDate.value) || "";
    const endStr = toLocalISOString(endDate.value) || "";

    let fetchInterval = 60;

    const fixedStart = new Date(startDate.value);
    const fixedEnd = new Date(endDate.value);
    const diffMs = fixedEnd.getTime() - fixedStart.getTime();
    const diffDays = diffMs / (1000 * 3600 * 24);

    if (isRealtime.value) {
      fetchInterval = intervalSeconds.value;
    } else {
      if (diffDays <= 1) fetchInterval = 5;
      else if (diffDays <= 3) fetchInterval = 10;
      else if (diffDays <= 7) fetchInterval = 60;
      else if (diffDays <= 30) fetchInterval = 600;
      else fetchInterval = 1800;
    }

    const rawData = await performanceApi.getHistory(
      startStr,
      endStr,
      [selectedEqpId.value],
      fetchInterval
    );

    chartData.value = rawData
      .filter((d) => d.timestamp)
      .map((d) => {
        let ts = String(d.timestamp || "");
        if (ts.includes(".")) {
          ts = ts.split(".")[0] ?? ts;
        }
        if (ts.includes("Z")) ts = ts.replace("Z", "");

        return {
          eqpId: d.eqpId || "",
          timestamp: ts,
          cpuUsage: Number(d.cpuUsage ?? 0),
          memoryUsage: Number(d.memoryUsage ?? 0),
          cpuTemp: Number(d.cpuTemp ?? 0),
          gpuTemp: Number(d.gpuTemp ?? 0),
          fanSpeed: Number(d.fanSpeed ?? 0),
        };
      });

    calculateSummary(chartData.value);
  } catch (e) {
    console.error(e);
    chartData.value = [];
    summaryData.value = [];
  } finally {
    if (!silent) isLoading.value = false;
  }
};

const calculateSummary = (data: PerformanceDataPointDto[]) => {
  if (!data || data.length === 0) {
    summaryData.value = [];
    return;
  }
  let cpuPeakItem = data[0] as PerformanceDataPointDto;
  let memPeakItem = data[0] as PerformanceDataPointDto;
  let gpuPeakItem = data[0] as PerformanceDataPointDto;

  for (const d of data) {
    if ((d.cpuUsage ?? 0) > (cpuPeakItem.cpuUsage ?? 0)) cpuPeakItem = d;
    if ((d.memoryUsage ?? 0) > (memPeakItem.memoryUsage ?? 0)) memPeakItem = d;
    if ((d.gpuTemp ?? 0) > (gpuPeakItem.gpuTemp ?? 0)) gpuPeakItem = d;
  }

  summaryData.value = [
    {
      eqpId: selectedEqpId.value || "",
      cpuPeakTime: cpuPeakItem.timestamp ?? "",
      cpuMax: cpuPeakItem.cpuUsage,
      cpuTempAtPeak: cpuPeakItem.cpuTemp,
      fanSpeedAtPeak: cpuPeakItem.fanSpeed,
      memPeakTime: memPeakItem.timestamp ?? "",
      memMax: memPeakItem.memoryUsage,
      gpuPeakTime: gpuPeakItem.timestamp ?? "",
      gpuMax: gpuPeakItem.gpuTemp,
    },
  ];
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

const fmt = (val: number | string | undefined, digits: number) => {
  const num = Number(val);
  return !isNaN(num) && val !== undefined && val !== null
    ? num.toFixed(digits)
    : "-";
};
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
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}
:deep(.p-select-clear-icon),
:deep(.p-datepicker-clear-icon) {
  @apply text-[9px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300;
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
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
:deep(.p-select-filter-container) {
  @apply !p-2;
}
:deep(.p-select-filter-input) {
  @apply !text-xs !py-1.5 !px-2;
}

:deep(.small-text-dropdown .p-select-label) {
  font-size: 11px !important;
  padding: 4px 8px !important;
}
</style>


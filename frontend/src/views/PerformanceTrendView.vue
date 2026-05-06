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
            System Resource Multi-Equipment Monitoring
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

        <div class="w-[180px] shrink-0">
          <MultiSelect
            v-model="selectedEqpIds"
            :options="eqpIds"
            filter
            resetFilterOnHide
            showClear
            placeholder="Select EQPs"
            :maxSelectedLabels="1"
            class="w-full custom-dropdown small multi-filter"
            overlayClass="custom-multiselect-panel"
            :disabled="!filterStore.selectedSdwt || isRealtime"
            :loading="isEqpLoading"
            @change="onEqpIdsChange"
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
            :disabled="selectedEqpIds.length === 0 || isRealtime || isLoading"
          />
          <Button
            icon="pi pi-refresh"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Reset'"
            class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300"
            @click="resetFilters"
            :disabled="isRealtime"
          />
        </div>
        <div class="w-px h-4 mx-1 bg-slate-200 dark:bg-zinc-700"></div>
        <div
          class="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-lg px-2 py-0.5 border border-slate-100 dark:border-zinc-800"
          :class="{
            'opacity-50 pointer-events-none': selectedEqpIds.length === 0,
          }"
        >
          <div
            class="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
          >
            <span>AUTO</span><i class="pi pi-clock text-[9px]"></i>
          </div>
          <Select
            v-model="intervalSeconds"
            :options="intervalOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Off"
            class="w-[100px] h-6 !border-0 !bg-transparent !text-[11px] small-text-dropdown"
            :class="{ '!text-rose-500 font-bold': isRealtime }"
            overlayClass="custom-dropdown-panel small"
            @change="toggleRealtime"
            :disabled="selectedEqpIds.length === 0"
          />
        </div>
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="relative flex flex-col flex-1 min-h-0 gap-3 pb-2 animate-fade-in"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center border border-transparent bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl"
      >
        <div class="relative">
          <div
            class="w-12 h-12 border-4 rounded-full border-slate-100 dark:border-zinc-800"
          ></div>
          <div
            class="absolute top-0 left-0 w-12 h-12 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"
          ></div>
        </div>
        <p class="mt-4 text-xs font-bold text-slate-500 animate-pulse">
          Loading Multi-Eqp Data...
        </p>
      </div>

      <div
        class="grid flex-1 min-h-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:grid-rows-2"
      >
        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <h3
            class="flex items-center gap-2 mb-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <i class="text-blue-500 pi pi-desktop"></i>
            {{ chartTitlePrefix }} CPU Usage
          </h3>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="cpuOption"
              class="w-full h-full"
            />
          </div>
        </div>
        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <h3
            class="flex items-center gap-2 mb-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <i class="pi pi-microchip text-emerald-500"></i>
            {{ chartTitlePrefix }} Memory Usage
          </h3>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="memOption"
              class="w-full h-full"
            />
          </div>
        </div>
        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <h3
            class="flex items-center gap-2 mb-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <i class="pi pi-cog text-amber-500"></i> {{ chartTitlePrefix }} CPU
            Temp & Fan
          </h3>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="cpuTempFanOption"
              class="w-full h-full"
            />
          </div>
        </div>
        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <h3
            class="flex items-center gap-2 mb-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <i class="text-orange-500 pi pi-palette"></i>
            {{ chartTitlePrefix }} GPU Temp
          </h3>
          <div class="relative flex-1 w-full min-h-0">
            <EChart
              v-if="chartData.length > 0"
              :option="gpuOption"
              class="w-full h-full"
            />
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-auto shrink-0 flex flex-col"
      >
        <div
          class="flex items-center gap-2 px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 shrink-0"
        >
          <i class="text-xs text-teal-500 pi pi-list"></i>
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
            Performance Summary (Peak Values)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table
            class="w-full text-[11px] text-left table-fixed text-slate-600 dark:text-slate-400"
          >
            <thead
              class="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800"
            >
              <tr>
                <th class="px-4 py-2 w-[120px] font-bold">EQP ID</th>
                <th class="px-4 py-2">CPU Peak</th>
                <th class="px-4 py-2">CPU Max</th>
                <th class="px-4 py-2">CPU Temp</th>
                <th class="px-4 py-2">Fan</th>
                <th class="px-4 py-2">Mem Peak</th>
                <th class="px-4 py-2">Mem Max</th>
                <th class="px-4 py-2">GPU Peak</th>
                <th class="px-4 py-2">GPU Max</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-for="item in summaryData"
                :key="item.eqpId"
                class="hover:bg-slate-50 dark:hover:bg-zinc-900/50"
              >
                <td
                  class="px-4 py-1.5 font-bold text-slate-700 dark:text-slate-200"
                >
                  {{ item.eqpId }}
                </td>
                <td class="px-4 py-1.5 font-mono">
                  {{ formatDate(item.cpuPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.cpuMax, 2) }}
                </td>
                <td class="px-4 py-1.5 font-mono">
                  {{ fmt(item.cpuTempAtPeak, 1) }}
                </td>
                <td class="px-4 py-1.5 font-mono">
                  {{ fmt(item.fanSpeedAtPeak, 0) }}
                </td>
                <td class="px-4 py-1.5 font-mono">
                  {{ formatDate(item.memPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.memMax, 2) }}
                </td>
                <td class="px-4 py-1.5 font-mono">
                  {{ formatDate(item.gpuPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.gpuMax, 1) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] text-slate-400 opacity-50 select-none"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i class="text-4xl pi pi-chart-line"></i>
      </div>
      <p class="text-sm font-bold text-slate-500">
        Ready to Analyze Performance
      </p>
      <p class="mt-1 text-xs">
        Select Equipments and Time Range to compare performance trends.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useFilterStore } from "@/stores/filter";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import {
  performanceApi,
  type PerformanceDataPointDto,
} from "@/api/performance";
import EChart from "@/components/common/EChart.vue";
import dayjs from "dayjs";

import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";
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
const selectedEqpIds = ref<string[]>([]);

const chartColors = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

// 👨‍💻 [수정 1] 현재시간 기준 24시간 전을 기본 startDate로 설정 (dayjs 활용)
const startDate = ref<Date>(dayjs().subtract(24, 'hour').toDate());
const endDate = ref<Date>(dayjs().toDate());

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
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const intervalOptions = [
  { label: "Manual", value: 0 },
  { label: "10 Sec", value: 10 },
  { label: "1 Min", value: 60 },
  { label: "5 Min", value: 300 },
];
const chartTitlePrefix = computed(() =>
  selectedEqpIds.value.length === 0
    ? ""
    : selectedEqpIds.value.length === 1
      ? `${selectedEqpIds.value[0]} -`
      : `Compare -`,
);

watch([startDate, endDate], ([newStart, newEnd], [oldStart]) => {
  if (newStart && newEnd && newStart.getTime() > newEnd.getTime()) {
    if (newStart.getTime() !== oldStart?.getTime())
      endDate.value = new Date(newStart);
    else startDate.value = new Date(newEnd);
  }
});

// 👨‍💻 [수정 2] 9시간 파싱 오차를 막기 위해 타임존 정보를 포함한 표준 ISO 포맷 사용
const getISODateString = (date: Date | null | undefined): string => {
  if (!date) return "";
  return date.toISOString();
};

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  let tSite =
    filterStore.selectedSite ||
    authStore.user?.site ||
    localStorage.getItem("performance_site") ||
    "";
  let tSdwt =
    filterStore.selectedSdwt ||
    authStore.user?.sdwt ||
    localStorage.getItem("performance_sdwt") ||
    "";

  if (tSite && sites.value.includes(tSite)) {
    filterStore.selectedSite = tSite;
    sdwts.value = await dashboardApi.getSdwts(tSite);
    if (tSdwt && sdwts.value.includes(tSdwt)) {
      filterStore.selectedSdwt = tSdwt;
      await loadEqpIds();
      try {
        const saved = localStorage.getItem("performance_eqpids");
        if (saved) {
          selectedEqpIds.value = JSON.parse(saved).filter((id: string) =>
            eqpIds.value.includes(id),
          );
          
          if (selectedEqpIds.value.length > 0) {
            searchData();
          }
        }
      } catch (e) {}
    }
  }

  themeObserver = new MutationObserver(
    () =>
      (isDarkMode.value = document.documentElement.classList.contains("dark")),
  );
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  themeObserver?.disconnect();
});

const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("performance_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  }
  filterStore.selectedSdwt = "";
  selectedEqpIds.value = [];
  eqpIds.value = [];
  hasSearched.value = false;
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("performance_sdwt", filterStore.selectedSdwt);
    await loadEqpIds();
  }
  selectedEqpIds.value = [];
  hasSearched.value = false;
};

const onEqpIdsChange = () => {
  localStorage.setItem(
    "performance_eqpids",
    JSON.stringify(selectedEqpIds.value),
  );
  
  if (selectedEqpIds.value.length > 0) {
    searchData();
  } else {
    hasSearched.value = false;
    chartData.value = [];
    summaryData.value = [];
  }
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
    eqpIds.value = [];
  } finally {
    isEqpLoading.value = false;
  }
};

const resetFilters = () => {
  filterStore.reset();
  selectedEqpIds.value = [];
  sdwts.value = [];
  eqpIds.value = [];
  chartData.value = [];
  summaryData.value = [];
  hasSearched.value = false;
  intervalSeconds.value = 0;
  // 👨‍💻 [수정 3] 리셋 시에도 24시간 전으로 초기화
  startDate.value = dayjs().subtract(24, 'hour').toDate();
  endDate.value = dayjs().toDate();
};

const searchData = async (silent = false) => {
  if (selectedEqpIds.value.length === 0) return;
  hasSearched.value = true;
  if (!silent) isLoading.value = true;
  try {
    const startStr = getISODateString(startDate.value);
    const endStr = getISODateString(endDate.value);
    const diffDays =
      (new Date(endDate.value || new Date()).getTime() -
        new Date(startDate.value || new Date()).getTime()) /
      (1000 * 3600 * 24);
    let interval = isRealtime.value
      ? intervalSeconds.value
      : diffDays <= 1
        ? 5
        : diffDays <= 7
          ? 60
          : 600;
    const rawData = await performanceApi.getHistory(
      startStr,
      endStr,
      selectedEqpIds.value,
      interval,
    );
    chartData.value = rawData
      .filter((d) => d.timestamp)
      .map((d) => ({
        ...d,
        // 👨‍💻 [수정 4] replace("Z", "")를 제거하여 dayjs가 올바르게 KST로 렌더링하도록 보장
        timestamp: dayjs(d.timestamp).format("YYYY-MM-DD HH:mm:ss"),
        cpuUsage: Number(d.cpuUsage ?? 0),
        memoryUsage: Number(d.memoryUsage ?? 0),
        cpuTemp: Number(d.cpuTemp ?? 0),
        gpuTemp: Number(d.gpuTemp ?? 0),
        fanSpeed: Number(d.fanSpeed ?? 0),
      }));
    calculateSummary(chartData.value);
  } catch (e) {
    chartData.value = [];
    summaryData.value = [];
  } finally {
    if (!silent) isLoading.value = false;
  }
};

const unifiedTimestamps = computed(() =>
  Array.from(
    new Set(
      chartData.value
        .map((d) => d.timestamp)
        .filter((ts): ts is string => !!ts),
    ),
  ).sort(),
);

const eqpDataMap = computed(() => {
  const map = new Map<string, Record<string, any>>();
  selectedEqpIds.value.forEach((id) => map.set(id, {}));
  chartData.value.forEach((d) => {
    if (d.eqpId && d.timestamp) map.get(d.eqpId)![d.timestamp] = d;
  });
  return map;
});

const commonChartOption = () => ({
  tooltip: {
    trigger: "axis",
    backgroundColor: isDarkMode.value
      ? "rgba(24,24,27,0.9)"
      : "rgba(255,255,255,0.95)",
    borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
    textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b", fontSize: 11 },
  },
  grid: { left: 45, right: 35, top: 40, bottom: 25 },
  dataZoom: [{ type: "inside" }],
  xAxis: {
    type: "category",
    data: unifiedTimestamps.value,
    axisLabel: {
      color: isDarkMode.value ? "#cbd5e1" : "#475569",
      fontSize: 10,
      formatter: (v: string) => dayjs(v).format("MM-DD HH:mm"),
    },
    axisLine: {
      lineStyle: {
        color: isDarkMode.value ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      },
    },
  },
  legend: {
    show: true,
    type: "scroll",
    top: 5,
    right: 40,
    textStyle: {
      color: isDarkMode.value ? "#cbd5e1" : "#475569",
      fontSize: 10,
    },
  },
  yAxis: {
    type: "value",
    scale: true,
    axisLabel: {
      color: isDarkMode.value ? "#cbd5e1" : "#475569",
      fontSize: 10,
    },
    splitLine: {
      lineStyle: {
        color: isDarkMode.value ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      },
    },
  },
});

const cpuOption = computed(() => {
  const base = commonChartOption();
  const series = selectedEqpIds.value.map((id, i) => ({
    name: id,
    type: "line",
    smooth: true,
    showSymbol: false,
    itemStyle: { color: chartColors[i % chartColors.length] },
    data: unifiedTimestamps.value.map(
      (ts) => eqpDataMap.value.get(id)?.[ts]?.cpuUsage ?? null,
    ),
  }));
  return { ...base, series };
});

const memOption = computed(() => {
  const base = commonChartOption();
  const series = selectedEqpIds.value.map((id, i) => ({
    name: id,
    type: "line",
    smooth: true,
    showSymbol: false,
    itemStyle: { color: chartColors[i % chartColors.length] },
    data: unifiedTimestamps.value.map(
      (ts) => eqpDataMap.value.get(id)?.[ts]?.memoryUsage ?? null,
    ),
  }));
  return { ...base, series };
});

const gpuOption = computed(() => {
  const base = commonChartOption();
  const series = selectedEqpIds.value.map((id, i) => ({
    name: id,
    type: "line",
    smooth: true,
    showSymbol: false,
    itemStyle: { color: chartColors[i % chartColors.length] },
    data: unifiedTimestamps.value.map(
      (ts) => eqpDataMap.value.get(id)?.[ts]?.gpuTemp ?? null,
    ),
  }));
  return { ...base, series };
});

const cpuTempFanOption = computed(() => {
  const base = commonChartOption();
  const series: any[] = [];
  selectedEqpIds.value.forEach((id, i) => {
    const c = chartColors[i % chartColors.length];
    series.push({
      name: `${id}(T)`,
      type: "line",
      yAxisIndex: 0,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: c },
      data: unifiedTimestamps.value.map(
        (ts) => eqpDataMap.value.get(id)?.[ts]?.cpuTemp ?? null,
      ),
    });
    series.push({
      name: `${id}(F)`,
      type: "line",
      yAxisIndex: 1,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: c },
      lineStyle: { type: "dashed" },
      data: unifiedTimestamps.value.map(
        (ts) => eqpDataMap.value.get(id)?.[ts]?.fanSpeed ?? null,
      ),
    });
  });
  return {
    ...base,
    yAxis: [base.yAxis, { ...base.yAxis, splitLine: { show: false } }],
    series,
  };
});

const calculateSummary = (data: PerformanceDataPointDto[]) => {
  summaryData.value = [];
  selectedEqpIds.value.forEach((id) => {
    const dList = data.filter((d) => d.eqpId === id);
    if (!dList.length) return;
    let cp = dList[0]!;
    let mp = dList[0]!;
    let gp = dList[0]!;
    dList.forEach((d) => {
      if ((d.cpuUsage ?? 0) > (cp.cpuUsage ?? 0)) cp = d;
      if ((d.memoryUsage ?? 0) > (mp.memoryUsage ?? 0)) mp = d;
      if ((d.gpuTemp ?? 0) > (gp.gpuTemp ?? 0)) gp = d;
    });
    summaryData.value.push({
      eqpId: id,
      cpuPeakTime: cp.timestamp,
      cpuMax: cp.cpuUsage,
      cpuTempAtPeak: cp.cpuTemp,
      fanSpeedAtPeak: cp.fanSpeed,
      memPeakTime: mp.timestamp,
      memMax: mp.memoryUsage,
      gpuPeakTime: gp.timestamp,
      gpuMax: gp.gpuTemp,
    });
  });
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
    }, intervalSeconds.value * 1000) as any;
  } else {
    isRealtime.value = false;
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }
};

const updateRealtimeDates = () => {
  endDate.value = dayjs().toDate();
  startDate.value = dayjs(endDate.value).subtract(1, 'hour').toDate();
};

const formatDate = (v: string | undefined) =>
  v ? dayjs(v).format("MM-DD HH:mm:ss") : "-";

const fmt = (v: any, d: number) =>
  v !== undefined && v !== null && !isNaN(Number(v))
    ? Number(v).toFixed(d)
    : "-";
</script>

<style scoped>
/* 기본 Select / MultiSelect 스타일 */
:deep(.p-select),
:deep(.p-multiselect),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}

/* Select / MultiSelect 라벨 */
:deep(.custom-dropdown .p-select-label),
:deep(.custom-dropdown .p-multiselect-label) {
  @apply text-[13px] py-[5px] px-3;
}

/* DatePicker input */
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !px-2;
  height: 28px !important;
  line-height: 28px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* DatePicker wrapper 정렬 */
:deep(.date-picker .p-datepicker-input) {
  height: 28px !important;
}

/* 우측 dropdown 버튼 높이를 40 x 28로 고정 */
:deep(.date-picker button.p-datepicker-dropdown) {
  width: 40px !important;
  height: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  padding: 0 !important;
  margin: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}

/* 버튼 내부 아이콘 정렬 */
:deep(.date-picker button.p-datepicker-dropdown .pi) {
  font-size: 14px !important;
  line-height: 1 !important;
}

/* Dropdown 높이 */
:deep(.custom-dropdown.small) {
  @apply h-7 flex items-center;
}

/* hover 스타일 */
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}

:deep(.p-select-dropdown),
:deep(.p-autocomplete-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 !bg-transparent !border-0 !shadow-none;
  width: 24px !important;
  min-width: 24px !important;
  height: 28px !important;
  min-height: 28px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
}

:deep(.p-select-dropdown svg),
:deep(.p-autocomplete-dropdown svg) {
  @apply w-3 h-3;
}

/* EQP ID MultiSelect 입력창만 미세 보정 */
:deep(.multi-filter .p-multiselect-label) {
  @apply text-[13px] py-[5px] px-3;
}

/* EQP ID clear icon */
:deep(.multi-filter .p-multiselect-clear-icon) {
  right: 2rem !important;
  color: rgb(148 163 184) !important;
  width: 0.875rem !important;
  height: 0.875rem !important;
}

/* EQP ID dropdown icon area */
:deep(.multi-filter .p-multiselect-dropdown) {
  width: 24px !important;
  min-width: 24px !important;
  height: 28px !important;
  min-height: 28px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
}

/* 페이지 애니메이션 */
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

/* Auto Refresh dropdown */
:deep(.small-text-dropdown .p-select-label) {
  font-size: 11px !important;
  padding: 4px 8px !important;
}
</style>

<style>
/* EQP ID MultiSelect overlay만 별도 적용 */
.custom-multiselect-panel {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 180px !important;
}

.custom-multiselect-panel .p-multiselect-header {
  padding: 4px 8px !important;
}

.custom-multiselect-panel .p-multiselect-filter-container {
  padding: 4px !important;
}

.custom-multiselect-panel .p-multiselect-filter-input {
  font-size: 11px !important;
  padding: 4px 8px !important;
}

.custom-multiselect-panel .p-multiselect-option {
  font-size: 11px !important;
  padding: 4px 8px !important;
}

.custom-multiselect-panel .p-checkbox {
  transform: scale(0.9);
}
</style>

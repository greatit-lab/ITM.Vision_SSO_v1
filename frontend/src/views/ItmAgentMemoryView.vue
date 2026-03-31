<!-- frontend/src/views/ItmAgentMemoryView.vue -->
<template>
  <div class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col">
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
          <i class="text-lg text-cyan-600 pi pi-android dark:text-cyan-400"></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            ITM Agent Memory
          </h1>
          <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
            Global agent process memory (Usage & Commit) monitoring.
          </span>
        </div>
      </div>
    </div>

    <div class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm transition-colors duration-300 shrink-0">
      <div class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide">
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filterStore.selectedSite"
            :options="sites"
            placeholder="All Sites"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSite }"
            @change="onSiteChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filterStore.selectedSdwt"
            :options="sdwts"
            placeholder="All SDWTs"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSdwt }"
            :disabled="!filterStore.selectedSite"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="selectedEqpId"
            :options="eqpIds"
            :loading="isEqpIdLoading"
            filter
            resetFilterOnHide
            placeholder="All Equipments"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !selectedEqpId }"
            :disabled="!filterStore.selectedSdwt"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 mx-1 bg-slate-200 dark:bg-zinc-700 shrink-0"></div>

        <div class="min-w-[130px] shrink-0">
          <Select
            v-model="selectedYMin"
            :options="yMinOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Y-Min: Auto"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
          />
        </div>

        <div class="w-px h-6 mx-1 bg-slate-200 dark:bg-zinc-700 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="endDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800">
        <Button icon="pi pi-search" rounded class="!bg-cyan-600 !border-cyan-600 hover:!bg-cyan-700 !w-8 !h-8 !text-xs" @click="searchData" :disabled="isLoading" />
        <Button icon="pi pi-refresh" text rounded severity="secondary" v-tooltip.bottom="'Reset'" class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors" @click="resetFilters" />
      </div>
    </div>

    <div v-if="hasSearched" class="flex-1 flex flex-col gap-4 pb-2 min-h-0 animate-fade-in relative">
      <div v-if="isLoading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-transparent">
        <div class="relative">
          <div class="w-10 h-10 border-4 rounded-full border-slate-100 dark:border-zinc-800"></div>
          <div class="absolute top-0 left-0 w-10 h-10 border-4 rounded-full border-cyan-500 border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-3 text-xs font-bold text-slate-500 animate-pulse">Analyzing Agent Memory...</p>
      </div>

      <div class="relative flex flex-col h-[400px] shrink-0 p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800">
        <div class="flex items-center justify-between mb-2 shrink-0">
          <h3 class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <i class="text-cyan-500 pi pi-chart-line"></i>
            Agent Memory Trend - {{ displayedEqpCount }} Units
          </h3>
          
          <div class="flex items-center gap-4">
            <label class="relative inline-flex items-center cursor-pointer select-none group" v-tooltip.top="'점선(Commit) 데이터를 차트에 표시합니다.'">
              <input type="checkbox" v-model="showCommit" class="sr-only peer">
              <div class="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-[16px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-zinc-600 peer-checked:bg-cyan-500 shadow-inner"></div>
              <span class="ml-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Show Commit (점선)</span>
            </label>

            <span class="text-[10px] text-slate-400 font-medium border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-full flex gap-3 transition-all duration-300" :class="showCommit ? 'bg-slate-50 dark:bg-zinc-800/50' : ''">
              <span class="flex items-center gap-1"><span class="w-3 h-0.5 bg-slate-400 inline-block"></span> Usage (실선)</span>
              <span class="flex items-center gap-1 transition-opacity duration-300" :class="showCommit ? 'opacity-100' : 'opacity-30'"><span class="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block"></span> Commit (점선)</span>
            </span>
          </div>
        </div>

        <div class="relative w-full flex-1 min-h-0">
          <EChart v-if="!isLoading && chartData.length > 0" :option="chartOption" @chartCreated="onChartCreated" />
          <div v-else-if="!isLoading && chartData.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <i class="mb-2 text-2xl opacity-50 pi pi-info-circle"></i>
            <span class="text-xs">No agent data found for this period.</span>
          </div>
          <transition name="fade">
            <button v-if="isZoomed" @click="resetZoom" class="absolute top-2 right-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-10">
              <i class="pi pi-refresh" style="font-size: 0.7rem"></i> Reset Zoom
            </button>
          </transition>
        </div>
      </div>
      
      <div class="flex-none bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0">
          <div class="flex items-center gap-2">
            <i class="text-xs text-cyan-500 pi pi-list"></i>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Memory Statistics Summary</h3>
          </div>
          <div class="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            Period: <span class="font-bold text-slate-600 dark:text-slate-300">{{ formattedPeriod }}</span>
          </div>
        </div>

        <div class="overflow-auto custom-scrollbar" style="max-height: 300px">
          <table class="w-full text-xs text-left text-slate-600 dark:text-slate-400 table-fixed">
            <colgroup>
              <col class="w-[44px]" />
              <col class="w-[78px]" />
              <col class="w-[96px]" />
              <col class="w-[132px]" />
              <col class="w-[78px]" />
              <col class="w-[148px]" />
              <col class="w-[148px]" />
              <col class="w-[148px]" />
              <col class="w-[148px]" />
            </colgroup>

            <thead class="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 sticky top-0 z-10">
              <tr>
                <th scope="col" class="px-2 py-2.5 font-bold text-center">#</th>
                <th scope="col" class="px-3 py-2.5 font-bold">Site</th>
                <th scope="col" class="px-3 py-2.5 font-bold">SDWT</th>
                <th scope="col" class="px-3 py-2.5 font-bold">Eqp ID</th>
                <th scope="col" class="px-2 py-2.5 font-bold text-center">Ver.</th>
                <th scope="col" class="px-3 py-2.5 font-bold text-right">
                  <div class="flex items-center justify-end gap-1 cursor-help whitespace-nowrap" v-tooltip.top="'기간 내 최대 Usage / Commit'">
                    Max (Use / Com)
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-3 py-2.5 font-bold text-right">
                  <div class="flex items-center justify-end gap-1 cursor-help whitespace-nowrap" v-tooltip.top="'기간 내 평균 Usage / Commit'">
                    Avg (Use / Com)
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-3 py-2.5 font-bold text-right">
                  <div class="flex items-center justify-end gap-1 cursor-help whitespace-nowrap" v-tooltip.top="'마지막 시점 Usage / Commit'">
                    Last (Use / Com)
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-3 py-2.5 font-bold text-center">Trend</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-for="(stat, index) in eqpStats"
                :key="stat.uniqueKey"
                class="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/50 group"
              >
                <td class="px-2 py-2 font-mono text-center text-slate-400">
                  {{ index + 1 }}
                </td>

                <td
                  class="px-3 py-2 font-bold text-slate-600 dark:text-slate-300 truncate"
                  :title="stat.site"
                >
                  {{ stat.site || '-' }}
                </td>

                <td
                  class="px-3 py-2 font-bold text-slate-600 dark:text-slate-300 truncate"
                  :title="stat.sdwt"
                >
                  {{ stat.sdwt || '-' }}
                </td>

                <td
                  class="px-3 py-2 font-bold text-slate-800 dark:text-slate-100"
                  :title="stat.eqpId"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span
                      class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: stat.color }"
                    ></span>
                    <span class="truncate">{{ stat.eqpId }}</span>
                  </div>
                </td>

                <td class="px-2 py-2 font-mono text-center text-slate-500">
                  <span class="inline-flex items-center justify-center min-w-[52px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-[10px]">
                    {{ stat.version }}
                  </span>
                </td>

                <td class="px-3 py-2 font-mono font-bold text-right whitespace-nowrap">
                  <span class="text-cyan-600 dark:text-cyan-400">{{ formatNumber(stat.max) }}</span>
                  <span class="text-slate-300 dark:text-slate-600 mx-1">/</span>
                  <span class="text-indigo-400 dark:text-indigo-500">{{ formatNumber(stat.commitMax) }}</span>
                  <span class="ml-1 text-slate-400 dark:text-slate-500">MB</span>
                </td>

                <td class="px-3 py-2 font-mono text-right whitespace-nowrap">
                  <span class="text-slate-600 dark:text-slate-300">{{ formatNumber(stat.avg) }}</span>
                  <span class="text-slate-300 dark:text-slate-600 mx-1">/</span>
                  <span class="text-slate-500 dark:text-slate-400">{{ formatNumber(stat.commitAvg) }}</span>
                  <span class="ml-1 text-slate-400 dark:text-slate-500">MB</span>
                </td>

                <td
                  class="px-3 py-2 font-mono text-right whitespace-nowrap"
                  :class="stat.last === 0 ? 'opacity-50' : ''"
                >
                  <template v-if="stat.last === 0">-</template>
                  <template v-else>
                    <span class="text-slate-600 dark:text-slate-300">{{ formatNumber(stat.last) }}</span>
                    <span class="text-slate-300 dark:text-slate-600 mx-1">/</span>
                    <span class="text-slate-500 dark:text-slate-400">{{ formatNumber(stat.commitLast) }}</span>
                    <span class="ml-1 text-slate-400 dark:text-slate-500">MB</span>
                  </template>
                </td>

                <td class="px-3 py-2 text-center">
                  <span
                    v-if="stat.trend === 'unranked'"
                    class="inline-flex items-center justify-center min-w-[118px] text-slate-500 text-[10px] font-bold bg-slate-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    순위권 밖 (Unranked)
                  </span>
                  <span
                    v-else-if="stat.trend === 'high'"
                    class="inline-flex items-center justify-center min-w-[118px] text-red-500 text-[10px] font-bold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    높음 (High)
                  </span>
                  <span
                    v-else-if="stat.trend === 'low'"
                    class="inline-flex items-center justify-center min-w-[118px] text-emerald-500 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    낮음 (Low)
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center justify-center min-w-[118px] text-slate-500 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    안정적 (Stable)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]">
      <div class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800">
        <i class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-server"></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Ready to analyze agents.</p>
      <p class="mt-1 text-xs text-slate-400">Click search to view ITM Agent memory trends across all equipments.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { performanceApi, type ItmAgentDataDto } from "@/api/performance";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";
import dayjs from "dayjs";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

interface EqpStat {
  uniqueKey: string;
  site: string;
  sdwt: string;
  eqpId: string;
  version: string;
  legendName: string;
  color: string;
  max: number;
  avg: number;
  last: number;
  commitMax: number;
  commitAvg: number;
  commitLast: number;
  // 테이블 정렬 및 최적화를 위한 속성 추가
  trend: 'unranked' | 'high' | 'low' | 'stable';
  trendPriority: number; 
}

const filterStore = useFilterStore();
const selectedEqpId = ref("");

const showCommit = ref(false);

const selectedYMin = ref<number | null>(null);
const yMinOptions = [
  { label: 'Y-Min: Auto', value: null },
  { label: 'Y-Min: 0 MB', value: 0 },
  { label: 'Y-Min: 200 MB', value: 200 },
  { label: 'Y-Min: 400 MB', value: 400 },
  { label: 'Y-Min: 600 MB', value: 600 },
  { label: 'Y-Min: 800 MB', value: 800 },
  { label: 'Y-Min: 1,000 MB', value: 1000 },
];

const now = new Date();
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);
const yesterday = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

const startDate = ref(yesterday);
const endDate = ref(new Date());

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const chartData = ref<any[]>([]);
const eqpSeries = ref<any[]>([]);
const eqpStats = ref<EqpStat[]>([]);
const displayedEqpCount = ref(0);

const isLoading = ref(false);
const isEqpIdLoading = ref(false);
const hasSearched = ref(false);
const isZoomed = ref(false);
let chartInstance: ECharts | null = null;

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const colorPalette = [
  "#06b6d4", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6", "#f97316",
  "#d946ef", "#84cc16", "#0ea5e9", "#f43f5e", "#64748b"
];

watch([() => startDate.value, () => endDate.value], ([newStart, newEnd], [oldStart, oldEnd]) => {
  if (newStart && newEnd) {
    const startMs = newStart.getTime();
    const endMs = newEnd.getTime();
    if (startMs > endMs) {
      if (startMs !== oldStart?.getTime()) endDate.value = new Date(newStart);
      else if (endMs !== oldEnd?.getTime()) startDate.value = new Date(newEnd);
    }
  }
});

const toLocalISOString = (date: Date, isEndDate: boolean = false) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  
  if (isEndDate) {
    if (d.toDateString() === now.toDateString()) {
      d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    } else {
      d.setHours(23, 59, 59, 999);
    }
  } else {
    d.setHours(0, 0, 0, 0);
  }
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 19).replace("T", " ");
};

const parseSafeDate = (ts: string | Date | undefined): dayjs.Dayjs => {
  let str = String(ts || "");
  if (str.includes("Z")) str = str.replace("Z", "");
  if (/^\d{2}-\d{2}-\d{2}/.test(str)) str = "20" + str;
  return dayjs(str);
};

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  const targetSite = filterStore.selectedSite || localStorage.getItem("agentmem_site") || "";
  const targetSdwt = filterStore.selectedSdwt || localStorage.getItem("agentmem_sdwt") || "";

  if (targetSite && sites.value.includes(targetSite)) {
    filterStore.selectedSite = targetSite;
    sdwts.value = await dashboardApi.getSdwts(targetSite);
    if (targetSdwt && sdwts.value.includes(targetSdwt)) {
      filterStore.selectedSdwt = targetSdwt;
      await loadEqpIds();
      const savedEqpId = localStorage.getItem("agentmem_eqpid");
      if (savedEqpId && eqpIds.value.includes(savedEqpId)) selectedEqpId.value = savedEqpId;
    } else {
      filterStore.selectedSdwt = "";
      selectedEqpId.value = "";
    }
  } else {
    filterStore.selectedSite = "";
    filterStore.selectedSdwt = "";
  }

  searchData();

  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDarkMode.value = document.documentElement.classList.contains("dark");
      }
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});

const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("agentmem_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("agentmem_site");
    sdwts.value = [];
  }
  filterStore.selectedSdwt = "";
  localStorage.removeItem("agentmem_sdwt");
  selectedEqpId.value = "";
  localStorage.removeItem("agentmem_eqpid");
  eqpIds.value = [];
  searchData();
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("agentmem_sdwt", filterStore.selectedSdwt);
    await loadEqpIds();
  } else {
    localStorage.removeItem("agentmem_sdwt");
    eqpIds.value = [];
  }
  selectedEqpId.value = "";
  localStorage.removeItem("agentmem_eqpid");
  searchData();
};

const onEqpIdChange = () => {
  if (selectedEqpId.value) localStorage.setItem("agentmem_eqpid", selectedEqpId.value);
  else localStorage.removeItem("agentmem_eqpid");
  searchData();
};

const resetView = () => {
  hasSearched.value = false;
  chartData.value = [];
  eqpStats.value = [];
  eqpSeries.value = [];
};

const loadEqpIds = async () => {
  isEqpIdLoading.value = true;
  try {
    eqpIds.value = await equipmentApi.getEqpIds({ sdwt: filterStore.selectedSdwt, type: "agent" });
  } catch (e) {
    eqpIds.value = [];
  } finally {
    isEqpIdLoading.value = false;
  }
};

const searchData = async () => {
  hasSearched.value = true;
  isLoading.value = true;
  isZoomed.value = false;
  chartData.value = [];
  eqpSeries.value = [];
  eqpStats.value = [];

  try {
    const fixedStart = new Date(startDate.value);
    fixedStart.setHours(0, 0, 0, 0);
    
    const fixedEnd = new Date(endDate.value);
    const now = new Date();
    
    if (fixedEnd.toDateString() === now.toDateString()) {
      fixedEnd.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 999);
    } else {
      fixedEnd.setHours(23, 59, 59, 999);
    }

    const startStr = toLocalISOString(startDate.value);
    const endStr = toLocalISOString(endDate.value, true);

    const diffDays = (fixedEnd.getTime() - fixedStart.getTime()) / (1000 * 3600 * 24);
    let fetchInterval = 60;
    if (diffDays <= 1) fetchInterval = 60;
    else if (diffDays <= 3) fetchInterval = 300;
    else if (diffDays <= 7) fetchInterval = 600;
    else if (diffDays <= 30) fetchInterval = 1800;
    else fetchInterval = 3600;

    const rawData = await performanceApi.getItmAgentTrend(
      filterStore.selectedSite || "",
      filterStore.selectedSdwt || "",
      selectedEqpId.value || "",
      startStr,
      endStr,
      fetchInterval
    );
    processData(rawData);
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const processData = (data: ItmAgentDataDto[]) => {
  if (!data || data.length === 0) return;

  const activeEqpSet = new Set<string>();
  const eqpMetaMap = new Map<string, { site: string; sdwt: string; eqpId: string; version: string }>();

  data.forEach((item) => {
    const d = item as any;
    const rawId = d.eqpid ?? d.eqpId;
    const site = d.site || "-";
    const sdwt = d.sdwt || "-";
    const usage = Number(d.memoryUsageMB ?? d.memoryUsageMb) || 0;
    const commit = Number(d.memoryCommitMB ?? d.memoryCommitMb) || 0;

    if (rawId && (usage > 0 || commit > 0)) {
      const uniqueKey = `${site}_${sdwt}_${rawId}`;
      activeEqpSet.add(uniqueKey);
      if (!eqpMetaMap.has(uniqueKey)) {
        eqpMetaMap.set(uniqueKey, {
          site,
          sdwt,
          eqpId: String(rawId),
          version: d.agentVersion || "Unknown",
        });
      }
    }
  });

  const sortedUniqueKeys = Array.from(activeEqpSet).sort();
  displayedEqpCount.value = sortedUniqueKeys.length;
  if (sortedUniqueKeys.length === 0) return;

  const timeMap = new Map<string, any>();

  data.forEach((item) => {
    const d = item as any;
    const dt = parseSafeDate(d.timestamp);
    if (!dt.isValid()) return;
    const tsKey = dt.toISOString();

    if (!timeMap.has(tsKey)) timeMap.set(tsKey, { timestamp: tsKey });

    const rawId = d.eqpid ?? d.eqpId;
    const uniqueKey = `${d.site || "-"}_${d.sdwt || "-"}_${rawId}`;

    if (activeEqpSet.has(uniqueKey)) {
      timeMap.get(tsKey)![uniqueKey + "_usage"] = Number(d.memoryUsageMB ?? d.memoryUsageMb) || 0;
      timeMap.get(tsKey)![uniqueKey + "_commit"] = Number(d.memoryCommitMB ?? d.memoryCommitMb) || 0;
    }
  });

  for (const item of timeMap.values()) {
    sortedUniqueKeys.forEach((uniqueKey) => {
      if (item[uniqueKey + "_usage"] === undefined) {
        item[uniqueKey + "_usage"] = null;
        item[uniqueKey + "_commit"] = null;
      }
    });
  }

  chartData.value = Array.from(timeMap.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const lastBucket = chartData.value.length > 0 ? chartData.value[chartData.value.length - 1] : null;

  const series: any[] = [];
  const stats: EqpStat[] = [];

  sortedUniqueKeys.forEach((uniqueKey, idx) => {
    const meta = eqpMetaMap.get(uniqueKey)!;
    const color = colorPalette[idx % colorPalette.length] || "#888888";
    const displayVersion = meta.version.startsWith("v") ? meta.version : `v${meta.version}`;
    const legendName = `${meta.site} ${meta.sdwt} ${meta.eqpId}`;

    series.push({
      id: uniqueKey + "_usage",
      name: `${legendName} (Usage)`,
      type: "line",
      smooth: true,
      showSymbol: false,
      symbolSize: 2,
      itemStyle: { color },
      lineStyle: { width: 2, type: "solid" },
      encode: { x: "timestamp", y: uniqueKey + "_usage" },
      connectNulls: true,
    });

    series.push({
      id: uniqueKey + "_commit",
      name: `${legendName} (Commit)`,
      type: "line",
      smooth: true,
      showSymbol: false,
      symbolSize: 2,
      itemStyle: { color },
      lineStyle: { width: 2, type: "dashed", opacity: 0.6 },
      encode: { x: "timestamp", y: uniqueKey + "_commit" },
      connectNulls: true,
    });

    const pData = data.filter((item) => {
      const d = item as any;
      const rawId = d.eqpid ?? d.eqpId;
      return `${d.site || "-"}_${d.sdwt || "-"}_${rawId}` === uniqueKey;
    });

    const usageVals = pData.map((d) => Number((d as any).memoryUsageMB ?? (d as any).memoryUsageMb) || 0);
    const commitVals = pData.map((d) => Number((d as any).memoryCommitMB ?? (d as any).memoryCommitMb) || 0);

    let sumU = 0, maxU = 0, sumC = 0, maxC = 0;
    if (usageVals.length > 0) {
      sumU = usageVals.reduce((a, b) => a + b, 0);
      maxU = usageVals.reduce((a, b) => Math.max(a, b), 0);
    }
    if (commitVals.length > 0) {
      sumC = commitVals.reduce((a, b) => a + b, 0);
      maxC = commitVals.reduce((a, b) => Math.max(a, b), 0);
    }

    const avgU = pData.length > 0 ? sumU / pData.length : 0;
    const lastU = lastBucket && lastBucket[uniqueKey + "_usage"] !== null ? lastBucket[uniqueKey + "_usage"] : 0;
    const avgC = pData.length > 0 ? sumC / pData.length : 0;
    const lastC = lastBucket && lastBucket[uniqueKey + "_commit"] !== null ? lastBucket[uniqueKey + "_commit"] : 0;

    // [개선 포인트] 사전에 Trend를 계산하여 Priority Score와 함께 객체에 할당
    let trend: 'unranked' | 'high' | 'low' | 'stable' = 'stable';
    let trendPriority = 2; // 1: High, 2: Stable, 3: Low, 4: Unranked

    if (lastU === 0) {
      trend = 'unranked';
      trendPriority = 4;
    } else if (lastU > avgU * 1.1) {
      trend = 'high';
      trendPriority = 1;
    } else if (lastU < avgU * 0.9) {
      trend = 'low';
      trendPriority = 3;
    }

    stats.push({
      uniqueKey,
      site: meta.site,
      sdwt: meta.sdwt,
      eqpId: meta.eqpId,
      version: displayVersion,
      legendName,
      color,
      max: maxU,
      avg: avgU,
      last: lastU,
      commitMax: maxC,
      commitAvg: avgC,
      commitLast: lastC,
      trend,
      trendPriority
    });
  });

  eqpSeries.value = series;
  
  // [개선 포인트] 다중 정렬 로직 적용: 1순위 Last(내림차순), 2순위 Trend 우선순위(오름차순)
  eqpStats.value = stats.sort((a, b) => {
    // 1. Last Usage 기준 내림차순 정렬
    if (b.last !== a.last) {
      return b.last - a.last;
    }
    // 2. 값이 동일할 경우(Tie 발생 시), Trend 기준(High -> Stable -> Low -> Unranked) 정렬
    return a.trendPriority - b.trendPriority;
  });
};

const resetFilters = () => {
  filterStore.reset();
  selectedEqpId.value = "";
  selectedYMin.value = null; 
  showCommit.value = false;
  localStorage.removeItem("agentmem_site");
  localStorage.removeItem("agentmem_sdwt");
  localStorage.removeItem("agentmem_eqpid");
  sdwts.value = [];
  eqpIds.value = [];
  resetView();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  startDate.value = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  endDate.value = new Date();
};

const formattedPeriod = computed(() => {
  if (!startDate.value || !endDate.value) return "";
  const fmt = (d: Date) => dayjs(d).format("YYYY-MM-DD");
  return `${fmt(startDate.value)} ~ ${fmt(endDate.value)}`;
});

const formatNumber = (val: any) => {
  const num = Number(val);
  if (isNaN(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b", fontSize: 11 },
      formatter: (params: any) => {
        if (!params || !params[0]) return "";
        const xDate = new Date(params[0].axisValueLabel);
        const timeStr = isNaN(xDate.getTime())
          ? params[0].axisValueLabel
          : `${String(xDate.getHours()).padStart(2, "0")}:${String(xDate.getMinutes()).padStart(2, "0")}`;

        const sortedParams = [...params]
          .map((p) => ({ ...p, val: p.data && p.seriesId ? p.data[p.seriesId] : null }))
          .filter((p) => {
             if (p.val === undefined || p.val === null) return false;
             if (selectedYMin.value !== null && p.val < selectedYMin.value) return false;
             return true;
          })
          .sort((a, b) => b.val - a.val);

        if (sortedParams.length === 0) return "";

        let html = `<div class="font-bold mb-1 border-b border-gray-500 pb-1">${timeStr}</div>`;

        sortedParams.forEach((p: any) => {
          const isCommit = p.seriesName.includes("(Commit)");
          const dotStyle = isCommit
            ? `border: 1px solid ${p.color}; background-color: transparent;`
            : `background-color: ${p.color};`;
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;${dotStyle}"></span>`;

          html += `<div class="flex justify-between items-center gap-4 text-[10px] mb-0.5">
                     <span>${colorDot} ${p.seriesName}</span>
                     <span class="font-mono font-bold ${isCommit ? "text-indigo-400" : "text-cyan-500"}">${Number(p.val).toFixed(1)} MB</span>
                   </div>`;
        });

        return html;
      },
    },
    legend: {
      show: true,
      type: "scroll",
      orient: "vertical",
      right: 0,
      top: "middle",
      itemGap: 10,
      textStyle: { color: textColor, fontSize: 10, width: 200, overflow: "truncate" },
      pageIconColor: textColor,
      pageTextStyle: { color: textColor },
    },
    grid: { left: 50, right: 220, top: 30, bottom: 30 },
    dataZoom: [{ type: "inside", xAxisIndex: [0], filterMode: "filter" }],
    dataset: { source: chartData.value },
    xAxis: {
      type: "category",
      boundaryGap: false,
      axisLabel: {
        color: textColor,
        fontSize: 10,
        formatter: (value: string) => {
          const d = new Date(value);
          if (isNaN(d.getTime())) return value;
          return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        }
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: "Memory (MB)",
      nameTextStyle: { color: textColor, padding: [0, 0, 0, 10] },
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor } },
      min: selectedYMin.value !== null ? selectedYMin.value : undefined,
    },
    series: showCommit.value 
      ? eqpSeries.value 
      : eqpSeries.value.filter(s => !s.id.endsWith('_commit')),
  };
});

const onChartCreated = (instance: any) => {
  chartInstance = instance;
  instance.on("dataZoom", () => {
    const opt = instance.getOption();
    if (opt.dataZoom && opt.dataZoom[0]) {
      const start = opt.dataZoom[0].start;
      const end = opt.dataZoom[0].end;
      isZoomed.value = start > 0 || end < 100;
    }
  });
};

const resetZoom = () => {
  if (chartInstance) {
    chartInstance.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    isZoomed.value = false;
  }
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

:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}

:deep(.custom-dropdown.small) {
  @apply h-7;
}

:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}

:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
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

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

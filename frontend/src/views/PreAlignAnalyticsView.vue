<!-- frontend/src/views/PreAlignAnalyticsView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] pb-4"
  >
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i
          class="text-lg text-indigo-500 pi pi-compass dark:text-indigo-400"
        ></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          PreAlign Data
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Precision alignment trend & distribution analysis.
        </span>
      </div>
    </div>

    <div
      class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0"
    >
      <div
        class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSdwtChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.eqpId"
            :options="eqpIds"
            filter
            resetFilterOnHide
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            :loading="isEqpLoading"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.endDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-indigo-500 !border-indigo-500 hover:!bg-indigo-600 !w-8 !h-8 !text-xs"
          @click="search"
          :disabled="!filter.eqpId || isLoading"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.left="'Reset'"
          @click="reset"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-hidden relative">
      
      <div 
        v-if="!hasSearched" 
        class="flex flex-col items-center justify-center h-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm opacity-80"
      >
        <div class="p-6 rounded-full bg-slate-50 dark:bg-zinc-800/50 mb-4 animate-fade-in">
           <i class="text-5xl pi pi-search text-slate-300 dark:text-zinc-600"></i>
        </div>
        <h2 class="text-lg font-bold text-slate-600 dark:text-slate-300">Ready to Analyze</h2>
        <p class="text-sm text-slate-400 mt-2">Select Equipment ID and Date Range to start.</p>
      </div>

      <div v-else class="flex flex-col h-full gap-3">
        
        <div
          class="relative flex flex-col h-[calc(60%-20px)] bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
        >
          <div
            class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0"
          >
            <div class="flex items-center gap-2">
              <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
                {{ searchedEqpId ? `${searchedEqpId} - ` : "" }}Trend Analysis
              </h3>
              <span
                v-if="!isLoading"
                class="text-xs font-medium text-slate-400 dark:text-slate-500 ml-2"
              >
                ({{ chartData.length.toLocaleString() }} points)
              </span>
            </div>
          </div>
          
          <div class="relative flex-1 w-full min-h-0 group overflow-hidden">
            <div
              v-if="isLoading"
              class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
            >
              <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
            </div>
            
            <div
              v-else-if="chartData.length === 0"
              class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60"
            >
              <i class="mb-2 text-3xl pi pi-exclamation-circle opacity-30"></i>
              <span class="text-xs">No data found.</span>
            </div>

            <EChart
              v-else
              :option="trendOption"
              class="w-full h-full"
              @chartCreated="onChartCreated"
            />

            <transition name="fade">
              <button
                v-if="isZoomed && !isLoading && chartData.length > 0"
                @click="resetZoom"
                class="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-20 cursor-pointer"
              >
                <i class="pi pi-refresh" style="font-size: 0.7rem"></i>
                Reset Zoom
              </button>
            </transition>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 flex-1 min-h-0">
          
          <div
            class="relative flex flex-col bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
          >
            <div class="flex flex-col px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Wafer Centering
                </h3>
              </div>
              <span class="text-[10px] text-slate-400 mt-0.5">
                Wafer Center Position Distribution
              </span>
            </div>
            <div class="relative w-full h-[260px] p-2 overflow-hidden">
              <div v-if="isLoading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                 <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
              </div>
              <div v-else-if="chartData.length === 0" class="flex items-center justify-center h-full text-xs text-slate-400 opacity-60">
                 No data found
              </div>
              <EChart v-else :option="scatterOption" class="w-full h-full" />
            </div>
          </div>

          <div
            class="relative flex flex-col bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
          >
            <div class="flex flex-col px-4 py-1.5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Distribution & Stats
                  </h3>
                </div>
                <div class="flex bg-slate-100 dark:bg-zinc-800 rounded-lg p-0.5">
                  <button
                    v-for="tab in ['X', 'Y']"
                    :key="tab"
                    @click="activeTab = tab"
                    :class="[
                      'px-3 py-0.5 text-[10px] font-bold rounded-md transition-all',
                      activeTab === tab
                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    ]"
                  >
                    {{ tab }}
                  </button>
                </div>
              </div>
              <span class="text-[10px] text-slate-400 mt-0.5">
                X/Y Axis Distribution & Statistics
              </span>
            </div>

            <div class="flex flex-col w-full h-[260px] p-3 overflow-hidden relative">
               <div v-if="isLoading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-b-xl">
                 <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
               </div>

               <div v-else-if="chartData.length === 0" class="flex items-center justify-center h-full text-xs text-slate-400 opacity-60">
                  No data found
               </div>

               <template v-else>
                 <div class="grid grid-cols-4 gap-2 mb-2 shrink-0" v-if="currentStats">
                    <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 flex flex-col items-center">
                       <span class="text-[9px] text-slate-400 uppercase font-bold">Avg</span>
                       <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{{ currentStats.avg }}</span>
                    </div>
                    <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 flex flex-col items-center">
                       <span class="text-[9px] text-slate-400 uppercase font-bold">Std</span>
                       <span class="text-xs font-mono font-bold text-rose-500">{{ currentStats.std }}</span>
                    </div>
                    <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 flex flex-col items-center">
                       <span class="text-[9px] text-slate-400 uppercase font-bold">Min</span>
                       <span class="text-xs font-mono font-bold text-blue-500">{{ currentStats.min }}</span>
                    </div>
                    <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 flex flex-col items-center">
                       <span class="text-[9px] text-slate-400 uppercase font-bold">Max</span>
                       <span class="text-xs font-mono font-bold text-blue-500">{{ currentStats.max }}</span>
                    </div>
                 </div>
                 <div class="flex-1 min-h-0 w-full relative overflow-hidden">
                    <EChart :option="histogramOption" class="w-full h-full" />
                 </div>
               </template>
            </div>
          </div>

          <div
            class="relative flex flex-col bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
          >
            <div class="flex flex-col px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-1 h-4 bg-amber-500 rounded-full"></div>
                <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Notch Analysis
                </h3>
              </div>
              <span class="text-[10px] text-slate-400 mt-0.5">
                Correlation: Notch Angle vs Shift
              </span>
            </div>
            <div class="relative w-full h-[260px] p-2 overflow-hidden">
              <div v-if="isLoading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                 <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
              </div>
              <div v-else-if="chartData.length === 0" class="flex items-center justify-center h-full text-xs text-slate-400 opacity-60">
                 No data found
              </div>
              <EChart v-else :option="notchChartOption" class="w-full h-full" />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  computed,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { getEqpIds } from "@/api/equipment";
import { getPreAlignData, type PreAlignData } from "@/api/prealign";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";
// [추가] Day.js 도입
import dayjs from "dayjs";

// Components
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

// --- Store & Constants ---
const authStore = useAuthStore();
const LS_KEYS = {
  SITE: "prealign-view-site",
  SDWT: "prealign-view-sdwt",
  EQPID: "prealign-view-eqpid",
};

// --- State ---
// [수정] 날짜 초기화: '오늘 00:00:00' 기준 7일 전
const now = new Date();
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0); 
const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000); 

const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  startDate: sevenDaysAgo,
  endDate: new Date(),
});

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const isLoading = ref(false);
const isEqpLoading = ref(false);
const hasSearched = ref(false);
const chartData = ref<PreAlignData[]>([]);
const searchedEqpId = ref("");

// Zoom State
const isZoomed = ref(false);

// UI State
const activeTab = ref('X'); 

// Chart Instance & Observer
let chartInstance: ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

// Theme detection
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      isDarkMode.value = document.documentElement.classList.contains("dark");
    }
  });
});

// [핵심 유틸] 안전한 날짜 파싱 (YY-MM-DD -> 20YY-MM-DD 보정)
const parseSafeDate = (ts: string | Date | undefined | null): dayjs.Dayjs => {
  let str = String(ts || "");
  if (str.includes("Z")) str = str.replace("Z", ""); // UTC 문자 제거
  // YY-MM-DD 형식(Short Year) 감지 시 20을 붙여 Full Year로 보정
  if (/^\d{2}-\d{2}-\d{2}/.test(str)) {
      str = "20" + str;
  }
  return dayjs(str);
};

// [수정] Chart Event Handlers: Manual Resize Observer 적용
const onChartCreated = (instance: any) => {
  chartInstance = instance;
  
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize();
  });

  nextTick(() => {
    const el = instance.getDom();
    if (el?.parentElement) {
      resizeObserver?.observe(el.parentElement);
    }
  });
  
  instance.on("dataZoom", () => {
    const opt = instance.getOption();
    if (opt.dataZoom && opt.dataZoom[0]) {
      const start = opt.dataZoom[0].start;
      const end = opt.dataZoom[0].end;
      isZoomed.value = start > 0.1 || end < 99.9;
    }
  });
};

const resetZoom = () => {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: "dataZoom",
      start: 0,
      end: 100,
    });
    isZoomed.value = false;
  }
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// [Helper] Statistics Calculation
const calculateStats = (values: number[]) => {
  if (values.length === 0) return { avg: '-', std: '-', min: '-', max: '-' };
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(avgSquareDiff);

  return {
    min: min.toFixed(3),
    max: max.toFixed(3),
    avg: avg.toFixed(3),
    std: std.toFixed(4)
  };
};

const currentStats = computed(() => {
  if (chartData.value.length === 0) return null;
  let values: number[] = [];
  
  if (activeTab.value === 'X') values = chartData.value.map(d => d.xmm);
  else if (activeTab.value === 'Y') values = chartData.value.map(d => d.ymm);
  else return null; 
  
  return calculateStats(values);
});

// [Helper] Histogram Binning
const getHistogramData = (values: number[], bins: number = 20) => {
   if (values.length === 0) return { category: [], data: [] };

   const min = Math.min(...values);
   const max = Math.max(...values);
   const range = max - min;
   const interval = range / bins;
   
   if (range === 0) return { category: [min.toFixed(3)], data: [values.length] };

   const category: string[] = [];
   const data = new Array(bins).fill(0);

   for (let i = 0; i < bins; i++) {
      const start = min + i * interval;
      const end = start + interval;
      category.push(((start + end) / 2).toFixed(3));
   }

   values.forEach(v => {
      let idx = Math.floor((v - min) / interval);
      if (idx >= bins) idx = bins - 1; 
      data[idx]++;
   });

   return { category, data };
};


// [추가] 통합 날짜 보정 로직
watch(
  [() => filter.startDate, () => filter.endDate],
  ([newStart, newEnd], [oldStart, oldEnd]) => {
    if (newStart && newEnd) {
      const startMs = newStart.getTime();
      const endMs = newEnd.getTime();
      if (startMs > endMs) {
        if (startMs !== oldStart?.getTime()) filter.endDate = new Date(newStart);
        else if (endMs !== oldEnd?.getTime()) filter.startDate = new Date(newEnd);
      }
    }
  }
);

// [핵심] 로컬 시간 ISO 문자열 변환 함수
const toLocalISOString = (date: Date, isEndDate: boolean = false) => {
  if (!date) return "";
  const d = new Date(date);
  if (isEndDate) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 19).replace('T', ' '); 
};

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  
  let targetSite = localStorage.getItem(LS_KEYS.SITE) || "";
  let targetSdwt = "";

  if (targetSite) {
     targetSdwt = localStorage.getItem(LS_KEYS.SDWT) || "";
  } else {
     targetSite = authStore.user?.site || "";
     targetSdwt = authStore.user?.sdwt || "";
  }

  if (targetSite && sites.value.includes(targetSite)) {
    filter.site = targetSite;
    try {
      sdwts.value = await dashboardApi.getSdwts(targetSite);
      if (targetSdwt && sdwts.value.includes(targetSdwt)) {
        filter.sdwt = targetSdwt;
        isEqpLoading.value = true;
        try {
          eqpIds.value = await getEqpIds({ sdwt: targetSdwt, type: "prealign" });
        } finally {
          isEqpLoading.value = false;
        }
        const savedEqpId = localStorage.getItem(LS_KEYS.EQPID) || "";
        if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
          filter.eqpId = savedEqpId;
          search(); 
        }
      }
    } catch (e) { console.error(e); }
  }

  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  themeObserver.disconnect();
  window.removeEventListener("resize", handleResize);
  resizeObserver?.disconnect();
  resizeObserver = null;
});

// Watchers
watch(() => filter.site, (v) => v ? localStorage.setItem(LS_KEYS.SITE, v) : localStorage.removeItem(LS_KEYS.SITE));
watch(() => filter.sdwt, (v) => v ? localStorage.setItem(LS_KEYS.SDWT, v) : localStorage.removeItem(LS_KEYS.SDWT));
watch(() => filter.eqpId, (v) => v ? localStorage.setItem(LS_KEYS.EQPID, v) : localStorage.removeItem(LS_KEYS.EQPID));

// Handlers
const onSiteChange = async () => {
  filter.site ? (sdwts.value = await dashboardApi.getSdwts(filter.site)) : (sdwts.value = []);
  filter.sdwt = ""; filter.eqpId = ""; eqpIds.value = []; resetView();
};

const onSdwtChange = async () => {
  if (filter.sdwt) {
    isEqpLoading.value = true;
    try { eqpIds.value = await getEqpIds({ sdwt: filter.sdwt, type: "prealign" }); }
    finally { isEqpLoading.value = false; }
  } else { eqpIds.value = []; }
  filter.eqpId = ""; resetView();
};

const onEqpIdChange = () => resetView();
const resetView = () => { hasSearched.value = false; chartData.value = []; searchedEqpId.value = ""; isZoomed.value = false; };

const search = async () => {
  if (!filter.eqpId || !filter.startDate || !filter.endDate) return;
  hasSearched.value = true;
  isLoading.value = true;
  searchedEqpId.value = filter.eqpId;
  chartData.value = [];
  isZoomed.value = false;

  try {
    const res = await getPreAlignData({
      site: filter.site,
      sdwt: filter.sdwt,
      eqpId: filter.eqpId,
      startDate: toLocalISOString(filter.startDate),
      endDate: toLocalISOString(filter.endDate, true)
    });
    const data = (res && res.data) ? res.data : res;
    
    // [수정] 데이터 매핑 및 날짜 포맷팅 (Short Year 보정)
    chartData.value = (Array.isArray(data) ? data : []).map(d => ({
        ...d,
        timestamp: parseSafeDate(d.timestamp).isValid() 
             ? parseSafeDate(d.timestamp).format('YYYY-MM-DD HH:mm:ss')
             : d.timestamp
    })).sort((a, b) => {
        // 시간순 정렬
        return dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf();
    });

  } catch (e) {
    console.error("Failed to load PreAlign data:", e);
  } finally {
    isLoading.value = false;
  }
};

const reset = () => {
  filter.site = ""; filter.sdwt = ""; filter.eqpId = "";
  // [수정] 초기화 시 오늘 00:00:00 기준 7일 전
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0); 
  filter.startDate = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  filter.endDate = new Date();
  
  sdwts.value = []; eqpIds.value = [];
  resetView();
};

// --- Chart Options ---
const commonChartConfig = computed(() => {
   const isDark = isDarkMode.value;
   return {
      textColor: isDark ? "#cbd5e1" : "#475569",
      gridColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      tooltipBg: isDark ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)",
      tooltipBorder: isDark ? "#3f3f46" : "#e2e8f0",
      tooltipText: isDark ? "#fff" : "#1e293b",
   }
});

// 1. Trend Chart
const trendOption = computed(() => {
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipText } = commonChartConfig.value;
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText },
      formatter: (params: any) => {
         if (!params[0]) return "";
         // [수정] dayjs 포맷팅 사용
         const dateStr = dayjs(params[0].axisValue).format('MM-DD HH:mm');
         let html = `<div class="font-bold mb-1 border-b border-gray-500 pb-1 text-xs">${dateStr}</div>`;
         params.forEach((p: any) => {
            const val = p.value[1] !== undefined ? p.value[1].toFixed(4) : "-";
            html += `<div class="flex justify-between gap-4 text-xs mt-1"><span style="color:${p.color}">● ${p.seriesName}</span><span class="font-mono font-bold">${val}</span></div>`;
         });
         return html;
      }
    },
    legend: { show: true, top: 0, right: 80, textStyle: { color: textColor }, itemGap: 10 },
    grid: { left: 50, right: 50, top: 30, bottom: 25, containLabel: false },
    dataZoom: [{ type: "inside", xAxisIndex: [0], filterMode: "filter" }],
    xAxis: {
      type: "category", // [수정] Time 축을 Category로 변경하여 날짜 문자열 그대로 표시
      boundaryGap: false,
      data: chartData.value.map(d => d.timestamp),
      axisLabel: { 
        color: textColor, 
        fontSize: 10,
        formatter: (value: any) => dayjs(value).format('MM-DD HH:mm')
      },
      axisLine: { lineStyle: { color: gridColor } },
      splitLine: { show: false },
    },
    yAxis: [
      { type: "value", name: "Pos(mm)", position: "left", axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
      { type: "value", name: "Notch", position: "right", axisLabel: { color: textColor, fontSize: 10 }, splitLine: { show: false } }
    ],
    series: [
      { name: "X", type: "line", data: chartData.value.map(d => [d.timestamp, d.xmm]), yAxisIndex: 0, showSymbol: false, symbolSize: 2, itemStyle: { color: "#3b82f6" }, lineStyle: { width: 1 } },
      { name: "Y", type: "line", data: chartData.value.map(d => [d.timestamp, d.ymm]), yAxisIndex: 0, showSymbol: false, symbolSize: 2, itemStyle: { color: "#10b981" }, lineStyle: { width: 1 } },
      { name: "Notch", type: "line", data: chartData.value.map(d => [d.timestamp, d.notch]), yAxisIndex: 1, showSymbol: false, symbolSize: 2, itemStyle: { color: "#f59e0b" }, lineStyle: { width: 1 } },
    ],
  };
});

// 2. Scatter Plot (Wafer Centering) - Bottom Left
const scatterOption = computed(() => {
  const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipText } = commonChartConfig.value;
  const data = chartData.value.map(d => [d.xmm, d.ymm]);
  
  let maxVal = 1;
  if (chartData.value.length > 0) {
     const maxAbs = Math.max(
        ...chartData.value.map(d => Math.max(Math.abs(d.xmm), Math.abs(d.ymm)))
     );
     maxVal = maxAbs * 1.1; 
  }

  return {
    backgroundColor: "transparent",
    tooltip: {
       trigger: 'item',
       backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText },
       formatter: (p: any) => {
          return `<div class="text-xs font-bold mb-1">Point Data</div>
                  <div class="text-xs">X: ${p.value[0].toFixed(4)}</div>
                  <div class="text-xs">Y: ${p.value[1].toFixed(4)}</div>`;
       }
    },
    grid: { left: 40, right: 40, top: 30, bottom: 30, containLabel: true },
    xAxis: { 
       type: 'value', name: 'X (mm)', nameLocation: 'middle', nameGap: 20,
       min: -maxVal, max: maxVal,
       axisLabel: { 
         color: textColor, 
         fontSize: 10,
         formatter: (value: number) => value.toFixed(3)
       },
       splitLine: { lineStyle: { color: gridColor } },
       axisLine: { onZero: true, lineStyle: { color: textColor } }
    },
    yAxis: { 
       type: 'value', name: 'Y (mm)', nameLocation: 'middle', nameGap: 30,
       min: -maxVal, max: maxVal,
       axisLabel: { 
         color: textColor, 
         fontSize: 10,
         formatter: (value: number) => value.toFixed(3)
       },
       splitLine: { lineStyle: { color: gridColor } },
       axisLine: { onZero: true, lineStyle: { color: textColor } }
    },
    series: [{
       type: 'scatter',
       symbolSize: 4,
       data: data,
       itemStyle: { color: '#3b82f6', opacity: 0.6 }
    }]
  };
});

// 3. Distribution & Stats Chart - Bottom Middle
const histogramOption = computed(() => {
   const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipText } = commonChartConfig.value;
   
   let values: number[] = [];
   let color = '#3b82f6';

   if (activeTab.value === 'X') { values = chartData.value.map(d => d.xmm); color='#3b82f6'; }
   else if (activeTab.value === 'Y') { values = chartData.value.map(d => d.ymm); color='#10b981'; }
   
   const { category, data } = getHistogramData(values, 25);

   return {
      backgroundColor: "transparent",
      tooltip: {
         trigger: 'axis',
         backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText },
         formatter: (p: any) => {
            return `<div class="text-xs">Range: ${p[0].name}</div>
                    <div class="text-xs font-bold">Count: ${p[0].value}</div>`;
         }
      },
      grid: { left: 10, right: 10, top: 20, bottom: 20, containLabel: true },
      xAxis: {
         type: 'category',
         data: category,
         axisLabel: { color: textColor, fontSize: 9, interval: 'auto' },
         axisTick: { alignWithLabel: true },
         axisLine: { lineStyle: { color: gridColor } }
      },
      yAxis: {
         type: 'value',
         splitLine: { show: false },
         axisLabel: { show: false }
      },
      series: [{
         type: 'bar',
         data: data,
         itemStyle: { color: color, borderRadius: [2, 2, 0, 0] },
         barWidth: '90%'
      }]
   };
});

// 4. Notch Analysis Chart - Bottom Right
const notchChartOption = computed(() => {
   const { textColor, gridColor, tooltipBg, tooltipBorder, tooltipText } = commonChartConfig.value;
   
   const dataX = chartData.value.map(d => [d.notch, d.xmm]);
   const dataY = chartData.value.map(d => [d.notch, d.ymm]);
   
   return {
      backgroundColor: "transparent",
      tooltip: {
         trigger: 'item',
         backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText },
         formatter: (p: any) => {
            return `<div class="text-xs font-bold mb-1">${p.seriesName}</div>
                    <div class="text-xs">Notch: ${p.value[0].toFixed(4)}</div>
                    <div class="text-xs">Shift: ${p.value[1].toFixed(4)} mm</div>`;
         }
      },
      legend: { show: true, top: 0, right: 10, textStyle: { color: textColor }, itemGap: 10 },
      grid: { left: 40, right: 40, top: 30, bottom: 30, containLabel: true },
      xAxis: {
         type: 'value', name: 'Notch(deg)', nameLocation: 'middle', nameGap: 22,
         scale: true,
         axisLabel: { color: textColor, fontSize: 10 },
         splitLine: { lineStyle: { color: gridColor } },
         axisLine: { lineStyle: { color: textColor } }
      },
      yAxis: {
         type: 'value', name: 'Shift(mm)',
         axisLabel: { color: textColor, fontSize: 10 },
         splitLine: { lineStyle: { color: gridColor } },
         axisLine: { lineStyle: { color: textColor } }
      },
      series: [
         { 
            name: 'vs X', type: 'scatter', symbolSize: 4, 
            data: dataX, itemStyle: { color: '#3b82f6', opacity: 0.6 } 
         },
         { 
            name: 'vs Y', type: 'scatter', symbolSize: 4, 
            data: dataY, itemStyle: { color: '#10b981', opacity: 0.6 } 
         }
      ]
   };
});
</script>

<style scoped>
/* 기존 스타일 유지 */
:deep(.p-select), :deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) { @apply text-[13px] py-[5px] px-3; }
:deep(.custom-input-text.small) { @apply !text-[13px] !p-1 !h-7 !bg-transparent !border-0; }
:deep(.date-picker .p-inputtext) { @apply !text-[13px] !py-1 !px-2 !h-7; }
:deep(.custom-dropdown.small) { @apply h-7; }
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.p-select-dropdown) { @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none; }
:deep(.p-select-dropdown svg) { @apply w-3 h-3; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Transition for fade effect */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

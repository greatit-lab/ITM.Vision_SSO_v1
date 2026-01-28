<!-- frontend/src/views/ProcessMemoryView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i
            class="text-lg text-purple-600 pi pi-microchip dark:text-purple-400"
          ></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Process Memory
          </h1>
          <span
            class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >
            Top resource-consuming processes analysis.
          </span>
        </div>
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
            placeholder="Select EQP"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !selectedEqpId }"
            :disabled="!filterStore.selectedSdwt"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

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

      <div
        class="flex items-center gap-2 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-purple-600 !border-purple-600 hover:!bg-purple-700 !w-8 !h-8 !text-xs"
          @click="searchData"
          :disabled="!selectedEqpId || isLoading"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'Reset'"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
          @click="resetFilters"
        />
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex-1 flex flex-col gap-4 pb-2 min-h-0 animate-fade-in relative"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-transparent"
      >
        <div class="relative">
          <div
            class="w-10 h-10 border-4 rounded-full border-slate-100 dark:border-zinc-800"
          ></div>
          <div
            class="absolute top-0 left-0 w-10 h-10 border-4 rounded-full border-purple-500 border-t-transparent animate-spin"
          ></div>
        </div>
        <p class="mt-3 text-xs font-bold text-slate-500 animate-pulse">
          Loading Process Data...
        </p>
      </div>

      <div
        class="relative flex flex-col h-[400px] shrink-0 p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800"
      >
        <div class="flex items-center justify-between mb-2 shrink-0">
          <h3
            class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <i class="text-purple-500 pi pi-chart-line"></i>
            {{ selectedEqpId }} - Top Memory Consumers Trend
          </h3>
          <span class="text-[10px] text-slate-400 font-medium">
            (Displaying top {{ displayedProcessCount }} processes)
          </span>
        </div>

        <div class="relative w-full flex-1 min-h-0">
          <EChart
            v-if="xAxisData.length > 0"
            :option="chartOption"
            @chartCreated="onChartCreated"
          />

          <div
            v-else-if="!isLoading && xAxisData.length === 0"
            class="absolute inset-0 flex flex-col items-center justify-center text-slate-400"
          >
            <i class="mb-2 text-2xl opacity-50 pi pi-info-circle"></i>
            <span class="text-xs">No process data found for this period.</span>
          </div>

          <transition name="fade">
            <button
              v-if="isZoomed"
              @click="resetZoom"
              class="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-10"
            >
              <i class="pi pi-refresh" style="font-size: 0.7rem"></i>
              Reset Zoom
            </button>
          </transition>
        </div>
      </div>

      <div
        class="flex-none bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-auto shrink-0 flex flex-col"
      >
        <div
          class="flex items-center justify-between px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0"
        >
          <div class="flex items-center gap-2">
            <i class="text-xs text-purple-500 pi pi-list"></i>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
              {{ selectedEqpId }} - Process Statistics Summary
            </h3>
          </div>
          <div class="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <i class="pi pi-calendar mr-1 text-[10px]"></i>
            Period:
            <span class="font-bold text-slate-600 dark:text-slate-300">{{
              formattedPeriod
            }}</span>
          </div>
        </div>

        <div class="overflow-auto custom-scrollbar" style="max-height: 300px">
          <table
            class="w-full text-xs text-left text-slate-600 dark:text-slate-400 table-fixed"
          >
            <thead
              class="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 sticky top-0 z-10"
            >
              <tr>
                <th
                  scope="col"
                  class="px-4 py-2.5 font-bold w-[50px] text-center"
                >
                  #
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold">Process Name</th>

                <th scope="col" class="px-4 py-2.5 font-bold text-right">
                  <div
                    class="flex items-center justify-end gap-1 cursor-help"
                    v-tooltip.top="'조회 기간 내 최대 메모리 사용량 (Peak)'"
                  >
                    Max Usage
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold text-right">
                  <div
                    class="flex items-center justify-end gap-1 cursor-help"
                    v-tooltip.top="'조회 기간 내 전체 평균 사용량 (Mean)'"
                  >
                    Avg Usage
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold text-right">
                  <div
                    class="flex items-center justify-end gap-1 cursor-help"
                    v-tooltip.top="'가장 최근 수집된 시점의 사용량 (Current)'"
                  >
                    Last Recorded
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold text-center">
                  <div
                    class="flex items-center justify-center gap-1 cursor-help"
                    v-tooltip.top="'평균 대비 최근 사용량의 증감 상태'"
                  >
                    Trend
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-for="(proc, index) in processStats"
                :key="proc.name"
                class="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/50 group"
              >
                <td class="px-4 py-2 font-mono text-center text-slate-400">
                  {{ index + 1 }}
                </td>
                <td
                  class="flex items-center gap-2 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 truncate"
                >
                  <span
                    class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: proc.color }"
                  ></span>
                  <span class="truncate" :title="proc.name">{{
                    proc.name
                  }}</span>
                </td>
                <td
                  class="px-4 py-2 font-mono font-bold text-right text-purple-600 dark:text-purple-400"
                >
                  {{ formatNumber(proc.max) }} MB
                </td>
                <td class="px-4 py-2 font-mono text-right">
                  {{ formatNumber(proc.avg) }} MB
                </td>
                <td class="px-4 py-2 font-mono text-right text-slate-500">
                  {{ formatNumber(proc.last) }} MB
                </td>
                <td class="px-4 py-2 text-center">
                  <span
                    v-if="proc.last > proc.avg * 1.1"
                    class="text-red-500 text-[10px] font-bold bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded"
                  >
                    높음 (High)
                  </span>
                  <span
                    v-else-if="proc.last < proc.avg * 0.9"
                    class="text-emerald-500 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded"
                  >
                    낮음 (Low)
                  </span>
                  <span
                    v-else
                    class="text-slate-400 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded"
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

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i
          class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-server"
        ></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Ready to Analyze</p>
      <p class="mt-1 text-xs text-slate-400">
        Select Equipment and Date Range to view process memory usage.
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
import { performanceApi, type ProcessMemoryDataDto } from "@/api/performance";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";
import dayjs from "dayjs";

// UI Components
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

interface ProcessStat {
  name: string;
  color: string;
  max: number;
  avg: number;
  last: number;
}

const filterStore = useFilterStore();
const authStore = useAuthStore();
const selectedEqpId = ref("");

// [수정] 날짜 초기화 로직: '오늘 00:00:00' 기준으로 1일 전 설정
const now = new Date();
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0); // 오늘 00:00:00
const sevenDaysAgo = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000); 

const startDate = ref(sevenDaysAgo);
const endDate = ref(new Date());

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const xAxisData = ref<string[]>([]);
const processSeries = ref<any[]>([]);
const processStats = ref<ProcessStat[]>([]);
const displayedProcessCount = ref(0);

const isLoading = ref(false);
const isEqpIdLoading = ref(false);
const hasSearched = ref(false);
const isZoomed = ref(false);
let chartInstance: ECharts | null = null;

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const colorPalette = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

// [추가] 통합 날짜 보정 로직 (Start > End 시 자동 보정)
watch(
  [startDate, endDate],
  ([newStart, newEnd], [oldStart, oldEnd]) => {
    if (newStart && newEnd) {
      const startMs = newStart.getTime();
      const endMs = newEnd.getTime();

      // 시작일이 종료일보다 늦어지면
      if (startMs > endMs) {
        if (startMs !== oldStart?.getTime()) {
           // 시작일이 변경된 경우 -> 종료일을 시작일로 맞춤
           endDate.value = new Date(newStart);
        } else if (endMs !== oldEnd?.getTime()) {
           // 종료일이 변경된 경우 -> 시작일을 종료일로 맞춤
           startDate.value = new Date(newEnd);
        }
      }
    }
  }
);

// [핵심] 로컬 시간 ISO 문자열 변환 함수
const toLocalISOString = (date: Date, isEndDate: boolean = false) => {
  if (!date) return "";
  const d = new Date(date);
  
  if (isEndDate) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }

  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - offset);
  return localDate.toISOString().slice(0, 19).replace('T', ' '); 
};

// [핵심 유틸] 안전한 날짜 파싱 (YY-MM-DD -> 20YY-MM-DD 보정)
const parseSafeDate = (ts: string | Date | undefined): dayjs.Dayjs => {
  let str = String(ts || "");
  if (str.includes("Z")) str = str.replace("Z", ""); // UTC 문자 제거
  
  // YY-MM-DD 형식(Short Year) 감지 시 20을 붙여 Full Year로 보정
  if (/^\d{2}-\d{2}-\d{2}/.test(str)) {
      str = "20" + str;
  }
  return dayjs(str);
};

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();

  let targetSite = filterStore.selectedSite;
  let targetSdwt = filterStore.selectedSdwt;

  if (!targetSite) {
    targetSite = localStorage.getItem("process_site") || "";
    if (targetSite) {
      targetSdwt = localStorage.getItem("process_sdwt") || "";
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

      const savedEqpId = localStorage.getItem("process_eqpid");
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
  if (themeObserver) themeObserver.disconnect();
});

// --- Handlers ---
const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("process_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("process_site");
    sdwts.value = [];
  }

  filterStore.selectedSdwt = "";
  localStorage.removeItem("process_sdwt");
  selectedEqpId.value = "";
  localStorage.removeItem("process_eqpid");
  eqpIds.value = [];
  
  resetView();
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("process_sdwt", filterStore.selectedSdwt);
    await loadEqpIds();
  } else {
    localStorage.removeItem("process_sdwt");
    eqpIds.value = [];
  }

  selectedEqpId.value = "";
  localStorage.removeItem("process_eqpid");
  resetView();
};

const onEqpIdChange = () => {
  if (selectedEqpId.value) {
    localStorage.setItem("process_eqpid", selectedEqpId.value);
  } else {
    localStorage.removeItem("process_eqpid");
  }
  // [수정] EQP 변경 시 뷰 초기화
  resetView();
};

const resetView = () => {
  hasSearched.value = false;
  xAxisData.value = [];
  processSeries.value = [];
  processStats.value = [];
};

const loadEqpIds = async () => {
  isEqpIdLoading.value = true;
  try {
    eqpIds.value = await equipmentApi.getEqpIds({
      sdwt: filterStore.selectedSdwt,
      type: "agent"
    });
  } finally {
    isEqpIdLoading.value = false;
  }
};

const searchData = async () => {
  if (!selectedEqpId.value) return;
  
  hasSearched.value = true;
  isLoading.value = true;
  isZoomed.value = false;

  // 데이터 초기화
  xAxisData.value = [];
  processSeries.value = [];
  processStats.value = [];

  try {
    // [수정] toLocalISOString 사용
    const startStr = toLocalISOString(startDate.value);
    const endStr = toLocalISOString(endDate.value, true);

    const fixedStart = new Date(startDate.value);
    fixedStart.setHours(0, 0, 0, 0);
    const fixedEnd = new Date(endDate.value);
    fixedEnd.setHours(23, 59, 59, 999);

    const diffMs = fixedEnd.getTime() - fixedStart.getTime();
    const diffDays = diffMs / (1000 * 3600 * 24);
    let fetchInterval = 60;
    if (diffDays <= 1) fetchInterval = 60;
    else if (diffDays <= 3) fetchInterval = 300;
    else if (diffDays <= 7) fetchInterval = 600;
    else if (diffDays <= 30) fetchInterval = 1800;
    else fetchInterval = 3600;

    const rawData = await performanceApi.getProcessHistory({
      startDate: startStr,
      endDate: endStr,
      eqpId: selectedEqpId.value,
      interval: fetchInterval
    });
    processData(rawData);
  } catch (e) {
    console.error(e);
    xAxisData.value = [];
    processSeries.value = [];
    processStats.value = [];
  } finally {
    isLoading.value = false;
  }
};

const processData = (data: ProcessMemoryDataDto[]) => {
  if (!data || data.length === 0) {
    xAxisData.value = [];
    processSeries.value = [];
    processStats.value = [];
    return;
  }

  // [수정] 안전한 날짜 파싱 (parseSafeDate 사용)
  let maxTs = 0;
  if (data.length > 0) {
    maxTs = data.reduce((max, d) => {
      const dt = parseSafeDate(d.timestamp);
      const ts = dt.isValid() ? dt.valueOf() : 0;
      return ts > max ? ts : max;
    }, 0);
  }

  // [수정] 데이터 그룹화 (Bucketing) 로직 추가
  // Raw Data가 초 단위로 들어올 수 있으므로, 분 단위로 그룹화하여 차트 X축 정렬
  const bucketMap = new Map<string, Record<string, number>>();
  
  data.forEach(d => {
     const dt = parseSafeDate(d.timestamp);
     if(!dt.isValid()) return;
     
     // 분 단위로 Key 생성 (YYYY-MM-DD HH:mm)
     const key = dt.format('YYYY-MM-DD HH:mm');
     
     if(!bucketMap.has(key)) bucketMap.set(key, {});
     const bucket = bucketMap.get(key)!;
     
     // 해당 시간대(분)의 해당 프로세스 MAX 메모리 사용량 저장
     const currentVal = bucket[d.processName] || 0;
     bucket[d.processName] = Math.max(currentVal, Number(d.memoryUsageMB) || 0);
  });

  // Bucketed Data를 시간순 정렬
  const sortedKeys = Array.from(bucketMap.keys()).sort();
  xAxisData.value = sortedKeys; // X축 라벨

  // Top Process 선정 (전체 기간 Max 기준)
  const procStatsMap = new Map<string, { max: number; sum: number; count: number; last: number }>();
  
  data.forEach(d => {
      const val = Number(d.memoryUsageMB) || 0;
      if(!procStatsMap.has(d.processName)) {
          procStatsMap.set(d.processName, { max: 0, sum: 0, count: 0, last: 0 });
      }
      const stat = procStatsMap.get(d.processName)!;
      stat.max = Math.max(stat.max, val);
      stat.sum += val;
      stat.count++;
      
      // Last Value 갱신 (최대 시간과 일치하는 경우)
      const dt = parseSafeDate(d.timestamp);
      if (dt.isValid() && dt.valueOf() === maxTs) {
          stat.last = val;
      }
  });

  // Top 5 선정
  const allProcs = Array.from(procStatsMap.entries()).map(([name, stat]) => ({ name, ...stat }));
  const topProcs = allProcs.sort((a, b) => b.max - a.max).slice(0, 5);
  const targetNames = new Set(topProcs.map(p => p.name));
  
  displayedProcessCount.value = targetNames.size;

  // Chart Series 구성
  const series: any[] = [];
  const stats: ProcessStat[] = [];
  const sortedTargetProcs = Array.from(targetNames).sort();

  sortedTargetProcs.forEach((name, idx) => {
    const color = colorPalette[idx % colorPalette.length] ?? "#8b5cf6";
    
    // 각 시간대별 해당 프로세스 값 추출
    const seriesData = sortedKeys.map(key => {
        const bucket = bucketMap.get(key);
        return bucket ? (bucket[name] || 0) : 0;
    });

    series.push({
      name: name,
      type: "line",
      smooth: true,
      showSymbol: false, // 데이터가 많을 수 있으므로 심볼 숨김
      symbolSize: 2,
      itemStyle: { color: color },
      lineStyle: { width: 2 },
      data: seriesData, 
    });
    
    const statEntry = procStatsMap.get(name)!;

    stats.push({
      name,
      color,
      max: statEntry.max,
      avg: statEntry.sum / statEntry.count,
      last: statEntry.last,
    });
  });

  processSeries.value = series;
  processStats.value = stats.sort((a, b) => b.max - a.max);
};

const resetFilters = () => {
  filterStore.reset();
  selectedEqpId.value = "";

  localStorage.removeItem("process_site");
  localStorage.removeItem("process_sdwt");
  localStorage.removeItem("process_eqpid");

  sdwts.value = [];
  eqpIds.value = [];
  resetView();
  
  // [수정] 날짜 초기화 로직: '오늘 00:00:00' 기준으로 1일 전 설정
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0); 
  const sevenDaysAgo = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000); 
  
  endDate.value = now;
  startDate.value = sevenDaysAgo;
};

const formattedPeriod = computed(() => {
  if (!startDate.value || !endDate.value) return "";
  const fmt = (d: Date) => dayjs(d).format('YYYY-MM-DD');
  return `${fmt(startDate.value)} ~ ${fmt(endDate.value)}`;
});

const formatNumber = (val: any) => {
  const num = Number(val);
  if (isNaN(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  return {
    backgroundColor: "transparent",
    dataset: undefined,
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
      formatter: (params: any) => {
        if (!params || !params.length) return "";
        
        const rawLabel = params[0].axisValue; // YYYY-MM-DD HH:mm
        let html = `<div class="font-bold mb-1 border-b border-gray-500 pb-1">${rawLabel}</div>`;
        
        const sortedParams = [...params].sort(
          (a, b) => (b.value || 0) - (a.value || 0)
        );
        
        sortedParams.forEach((p: any) => {
          if (p.value !== undefined) {
            const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
            html += `<div class="flex justify-between items-center gap-4 text-xs"><span>${colorDot} ${
              p.seriesName
            }</span><span class="font-mono font-bold">${Number(
              p.value
            ).toLocaleString()} MB</span></div>`;
          }
        });
        return html;
      },
    },
    legend: {
      show: true,
      type: "scroll",
      orient: "vertical",
      right: 10,
      top: "middle",
      itemGap: 10,
      textStyle: {
        color: textColor,
        fontSize: 11,
        overflow: "truncate",
        width: 130,
      },
      pageIconColor: textColor,
      pageTextStyle: { color: textColor },
    },
    grid: { left: 60, right: 170, top: 30, bottom: 30 },
    dataZoom: [{ type: "inside", xAxisIndex: [0], filterMode: "filter" }],
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData.value, 
      axisLabel: {
        color: textColor,
        fontSize: 10,
        formatter: (value: string) => {
           // 분 단위 데이터이므로, 적절히 포맷팅 (예: 날짜+시간)
           return value ? value.substring(5) : value; // MM-DD HH:mm
        },
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: "Memory (MB)",
      nameTextStyle: { color: textColor, padding: [0, 0, 0, 20] },
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: processSeries.value,
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


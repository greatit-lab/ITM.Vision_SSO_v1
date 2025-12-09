<!-- frontend/src/views/LotUniformityTrendView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden">
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
        <i class="text-lg text-teal-600 pi pi-chart-line dark:text-teal-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Lot Uniformity
        </h1>
        <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
          Intra-wafer uniformity trend analysis.
        </span>
      </div>
    </div>

    <div class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-2 shadow-sm shrink-0 transition-colors duration-300">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide">
          <div class="min-w-[140px] shrink-0">
            <Select v-model="filterStore.selectedSite" :options="sites" placeholder="Site" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onSiteChange" />
          </div>
          <div class="min-w-[160px] shrink-0">
            <Select v-model="filterStore.selectedSdwt" :options="sdwts" placeholder="SDWT" :disabled="!filterStore.selectedSite" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onSdwtChange" />
          </div>
          <div class="min-w-[160px] shrink-0">
            <Select v-model="filters.eqpId" :options="eqpIds" filter placeholder="EQP ID" :disabled="!filterStore.selectedSdwt" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onEqpChange" />
          </div>
          <div class="min-w-[160px] shrink-0">
            <Select v-model="filters.lotId" :options="lotIds" filter placeholder="Lot ID" :disabled="!filters.eqpId" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onLotChange" />
          </div>
          <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>
          <div class="min-w-[130px] shrink-0">
            <DatePicker v-model="filters.startDate" showIcon dateFormat="yy-mm-dd" placeholder="Start" class="w-full custom-dropdown small date-picker" :disabled="!filters.eqpId" @update:model-value="onDateChange" />
          </div>
          <div class="min-w-[130px] shrink-0">
            <DatePicker v-model="filters.endDate" showIcon dateFormat="yy-mm-dd" placeholder="End" class="w-full custom-dropdown small date-picker" :disabled="!filters.eqpId" @update:model-value="onDateChange" />
          </div>
        </div>
        <div class="flex items-center gap-1 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800">
          <Button icon="pi pi-refresh" text rounded severity="secondary" v-tooltip.bottom="'Reset'" class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300" @click="resetFilters" />
        </div>
      </div>
    </div>

    <div v-if="filters.lotId" class="flex flex-col mb-3 shrink-0 animate-fade-in">
      <div class="relative grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm items-stretch">
        
        <div class="flex flex-col h-[8rem]" v-for="(step, idx) in steps" :key="idx" 
             :class="{ 'opacity-40 pointer-events-none grayscale': step.disabled }">
          <div class="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span class="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px]">{{ idx + 1 }}</span>
            {{ step.title }}
          </div>
          <div class="flex-1 overflow-y-auto border rounded-lg border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 custom-scrollbar">
            <ul class="p-1 space-y-1">
              <li v-if="step.list.length === 0" class="py-4 text-xs text-center text-slate-400 italic">{{ step.emptyMsg }}</li>
              <li v-for="item in step.list" :key="item" @click="step.action(item)"
                  class="px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-all flex items-center justify-between"
                  :class="step.selected === item ? 'bg-teal-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm'">
                <span class="truncate">{{ item }}</span>
                <i v-if="step.selected === item" class="pi pi-check text-[10px]"></i>
              </li>
            </ul>
          </div>
        </div>

        <template v-for="i in 3" :key="'arrow-'+i">
           <div class="hidden md:flex absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
                :style="{ left: (i * 20) + '%' }"
                :class="steps[i-1].selected ? 'text-teal-400 dark:text-teal-600' : 'text-slate-200 dark:text-zinc-800'">
             <i class="pi pi-angle-right text-xl"></i>
           </div>
        </template>

        <div class="flex items-center justify-center pl-3 border-l border-dashed border-slate-200 dark:border-zinc-800">
          <Button icon="pi pi-search" class="!w-14 !h-14 !rounded-2xl !text-xl shadow-lg transition-all active:scale-95"
            :class="isReadyToSearch ? '!bg-teal-600 hover:!bg-teal-700 !border-teal-600' : '!bg-slate-200 !border-slate-200 !text-slate-400 cursor-not-allowed'"
            :loading="isLoading" :disabled="!isReadyToSearch" @click="searchData" v-tooltip.left="'Analyze'" />
        </div>
      </div>
    </div>

    <div v-if="hasSearched" class="flex flex-1 min-h-0 gap-4 pb-2 overflow-hidden lg:flex-row flex-col fade-in">
      
      <div class="flex flex-col flex-[2] overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-teal-500 rounded-full"></div>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Trend by Point ({{ filters.metric?.toUpperCase() }})
            </h3>
          </div>
          <span class="text-[10px] text-slate-400 font-mono" v-if="chartSeries.length > 0">
             {{ chartSeries.length }} Wafers / {{ totalPoints }} Points
          </span>
        </div>
        <div class="relative flex-1 w-full min-h-0">
          <EChart :option="lineChartOption" class="w-full h-full" @click="onLineChartClick" />
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Wafer Map Point
            </h3>
          </div>
          <div class="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            <button @click="setMapMode('point')" class="px-2 py-0.5 text-[10px] font-bold rounded-md transition-all"
              :class="mapMode === 'point' ? 'bg-white dark:bg-zinc-700 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'">Point</button>
            <button @click="setMapMode('heatmap')" class="px-2 py-0.5 text-[10px] font-bold rounded-md transition-all"
              :class="mapMode === 'heatmap' ? 'bg-white dark:bg-zinc-700 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'">Heatmap</button>
          </div>
        </div>

        <div class="px-4 py-1.5 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-dashed border-slate-200 dark:border-zinc-800 flex items-center gap-2 h-10 shrink-0 overflow-hidden transition-opacity duration-300"
             :class="{ 'opacity-40 pointer-events-none grayscale': mapMode === 'point' }">
           <span class="text-[10px] text-slate-500 font-bold shrink-0">Select Wafer:</span>
           <div class="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
             <button v-for="wId in availableWafers" :key="wId"
               @click="selectWafer(wId)"
               class="min-w-[26px] h-[22px] text-[10px] font-mono rounded flex items-center justify-center transition-all shrink-0 border"
               :class="selectedWaferId === wId 
                 ? 'bg-teal-500 text-white border-teal-500 font-bold shadow-sm scale-105' 
                 : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 hover:border-teal-300 hover:text-teal-600'">
               {{ wId }}
             </button>
           </div>
        </div>

        <div class="relative flex-1 w-full min-h-0 p-2 flex items-center justify-center overflow-hidden">
          <div class="relative h-full w-full max-w-full max-h-full aspect-square flex items-center justify-center bg-slate-50/50 dark:bg-black/20 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800/50">
             
             <div v-if="mapMode === 'heatmap' && !selectedWaferId" 
                  class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] text-center p-4">
                <i class="pi pi-th-large text-2xl text-slate-400 mb-2 animate-pulse"></i>
                <p class="text-xs font-bold text-slate-600 dark:text-slate-300">Select a Wafer</p>
                <p class="text-[10px] text-slate-400 mt-1">Select from the list above<br>or click the trend line.</p>
             </div>

             <EChart :option="mapChartOption" class="w-full h-full" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]">
      <div class="flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800">
        <i class="text-3xl pi pi-chart-scatter text-slate-300 dark:text-zinc-600"></i>
      </div>
      <p class="text-sm font-medium">Ready to Analyze</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { waferApi, type LotUniformitySeriesDto } from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

const filterStore = useFilterStore();
const isLoading = ref(false);
const hasSearched = ref(false);
const mapMode = ref<'point' | 'heatmap'>('point');
const selectedWaferId = ref<number | null>(null);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const lotIds = ref<string[]>([]);
const cassetteRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const films = ref<string[]>([]);
const metrics = ref<string[]>([]);

const filters = reactive({
  eqpId: "", lotId: "", startDate: new Date(Date.now() - 7 * 864e5), endDate: new Date(),
  cassetteRcp: "", stageGroup: "", film: "", metric: ""
});

const chartSeries = ref<LotUniformitySeriesDto[]>([]);
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const steps = computed(() => [
  { title: 'Cassette RCP', list: cassetteRcps.value, selected: filters.cassetteRcp, action: selectCassette, disabled: false, emptyMsg: 'No Items' },
  { title: 'Stage Group', list: stageGroups.value, selected: filters.stageGroup, action: selectStageGroup, disabled: !filters.cassetteRcp, emptyMsg: 'Wait...' },
  { title: 'Film', list: films.value, selected: filters.film, action: (v: string) => filters.film = v, disabled: !filters.stageGroup, emptyMsg: 'Wait...' },
  { title: 'Y-Axis Metric', list: metrics.value, selected: filters.metric, action: (v: string) => filters.metric = v, disabled: !filters.stageGroup, emptyMsg: 'Loading...' }
]);

const isReadyToSearch = computed(() => filters.lotId && filters.cassetteRcp && filters.stageGroup && filters.film && filters.metric);
const availableWafers = computed(() => chartSeries.value.map(s => s.waferId).sort((a, b) => a - b));
const totalPoints = computed(() => chartSeries.value.reduce((acc, s) => acc + s.dataPoints.length, 0));

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  const savedSite = localStorage.getItem("lot_site");
  const savedSdwt = localStorage.getItem("lot_sdwt");
  const savedEqpId = localStorage.getItem("lot_eqpid");

  if (savedSite && sites.value.includes(savedSite)) {
    filterStore.selectedSite = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);
    if (savedSdwt) {
      filterStore.selectedSdwt = savedSdwt;
      eqpIds.value = await equipmentApi.getEqpIds(undefined, savedSdwt);
      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        filters.eqpId = savedEqpId;
        await loadLotIds(); 
      }
    }
  }
  themeObserver = new MutationObserver((m) => { m.forEach((mu) => { if (mu.attributeName === "class") isDarkMode.value = document.documentElement.classList.contains("dark"); }); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});
onUnmounted(() => themeObserver?.disconnect());

const onSiteChange = async () => { if(filterStore.selectedSite) { localStorage.setItem("lot_site", filterStore.selectedSite); sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite); } else { sdwts.value=[]; } clearStepsFrom(0); filterStore.selectedSdwt = ""; localStorage.removeItem("lot_sdwt"); filters.eqpId = ""; localStorage.removeItem("lot_eqpid"); };
const onSdwtChange = async () => { if(filterStore.selectedSdwt) { localStorage.setItem("lot_sdwt", filterStore.selectedSdwt); eqpIds.value = await equipmentApi.getEqpIds(undefined, filterStore.selectedSdwt); } else { eqpIds.value=[]; } clearStepsFrom(0); filters.eqpId = ""; localStorage.removeItem("lot_eqpid"); };
const onEqpChange = () => { if (filters.eqpId) { localStorage.setItem("lot_eqpid", filters.eqpId); loadLotIds(); } else { clearStepsFrom(0); } };
const onLotChange = () => { if (filters.lotId) loadCassettes(); else clearStepsFrom(1); };
const onDateChange = () => { if(filters.eqpId) loadLotIds(); };

const clearStepsFrom = (step: number) => {
  if (step<=0) { filters.lotId=""; lotIds.value=[]; }
  if (step<=1) { filters.cassetteRcp=""; cassetteRcps.value=[]; }
  if (step<=2) { filters.stageGroup=""; stageGroups.value=[]; }
  if (step<=3) { filters.film=""; films.value=[]; filters.metric=""; metrics.value=[]; }
  hasSearched.value=false; chartSeries.value=[]; selectedWaferId.value=null;
};

const loadLotIds = async () => { lotIds.value = await waferApi.getDistinctValues("lotids", getBaseParams()); clearStepsFrom(1); };
const loadCassettes = async () => { cassetteRcps.value = await waferApi.getDistinctValues("cassettercps", { ...getBaseParams(), lotId: filters.lotId }); clearStepsFrom(2); };
const selectCassette = async (val: string) => { filters.cassetteRcp=val; stageGroups.value = await waferApi.getDistinctValues("stagegroups", { ...getBaseParams(), lotId: filters.lotId, cassetteRcp: val }); clearStepsFrom(3); };
const selectStageGroup = async (val: string) => {
  filters.stageGroup=val; 
  const p = { ...getBaseParams(), lotId: filters.lotId, cassetteRcp: filters.cassetteRcp, stageGroup: val };
  const [f, m] = await Promise.all([waferApi.getDistinctValues("films", p), waferApi.getAvailableMetrics(p)]);
  films.value=f; metrics.value=m; filters.film=""; filters.metric="";
};
const getBaseParams = () => ({ eqpId: filters.eqpId, startDate: filters.startDate?.toISOString(), endDate: filters.endDate?.toISOString() });

const searchData = async () => {
  if (!isReadyToSearch.value) return;
  isLoading.value = true; hasSearched.value = true; selectedWaferId.value = null;
  try {
    chartSeries.value = await waferApi.getLotUniformityTrend({ ...getBaseParams(), lotId: filters.lotId, cassetteRcp: filters.cassetteRcp, stageGroup: filters.stageGroup, film: filters.film, metric: filters.metric });
  } finally { isLoading.value = false; }
};

const resetFilters = () => { filterStore.reset(); localStorage.removeItem("lot_site"); localStorage.removeItem("lot_sdwt"); localStorage.removeItem("lot_eqpid"); filters.eqpId=""; filters.startDate=new Date(Date.now()-7*864e5); filters.endDate=new Date(); sdwts.value=[]; eqpIds.value=[]; clearStepsFrom(0); };

// Handlers
const setMapMode = (mode: 'point' | 'heatmap') => { mapMode.value = mode; };
const selectWafer = (id: number) => { selectedWaferId.value = id; };
const onLineChartClick = (params: any) => { if (params.seriesName) { const id = parseInt(params.seriesName.replace('W', '')); if (!isNaN(id)) { selectedWaferId.value = id; mapMode.value = 'heatmap'; } } };

// --- Chart Options ---

// 1. Trend Chart (Highlighter + Tooltip Update)
const lineChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  
  const allPoints = chartSeries.value.flatMap(s => s.dataPoints.map(p => p.point));
  const minPoint = allPoints.length > 0 ? Math.min(...allPoints) : 0;
  const maxPoint = allPoints.length > 0 ? Math.max(...allPoints) : 20;

  const series = chartSeries.value.map((s) => {
    const isSelected = selectedWaferId.value === s.waferId;
    const isAnySelected = selectedWaferId.value !== null;
    return {
      name: `W${s.waferId}`,
      type: "line",
      showSymbol: true,
      symbolSize: isSelected ? 5 : 3, // Point size 3
      data: s.dataPoints.map(p => [p.point, p.value]),
      smooth: true,
      lineStyle: {
        width: isSelected ? 3 : 1, // Bold if selected
        opacity: isAnySelected && !isSelected ? 0.1 : 0.8, // Dim others
        color: isSelected ? '#14b8a6' : undefined 
      },
      itemStyle: { 
        opacity: isAnySelected && !isSelected ? 0.1 : 1,
        color: isSelected ? '#14b8a6' : undefined
      },
      z: isSelected ? 10 : 1, 
      triggerLineEvent: true 
    };
  });

  return {
    backgroundColor: "transparent",
    // [Tooltip 개선] Point No, Marker + WaferID : Value
    tooltip: { 
      trigger: "axis", 
      confine: true,
      backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b", fontSize: 11 },
      formatter: (params: any) => {
        let html = `<div class="font-bold mb-1 border-b pb-1 text-xs">Point #${params[0].value[0]}</div>`;
        html += `<div style="max-height: 200px; overflow-y: auto;">`;
        params.forEach((p: any) => {
           html += `<div class="flex justify-between items-center gap-3 text-xs mb-0.5">
                      <span>${p.marker} ${p.seriesName}</span>
                      <span class="font-mono font-bold">${p.value[1].toFixed(2)}</span>
                    </div>`;
        });
        html += `</div>`;
        return html;
      }
    },
    // [Grid] 여백 확보
    grid: { left: 40, right: 40, top: 40, bottom: 40, containLabel: true },
    // [Legend] 복구
    legend: { 
      show: true, type: 'scroll', top: 0, right: 10,
      textStyle: { color: textColor, fontSize: 10 } 
    },
    // [DataZoom] 복구
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, bottom: 0, height: 16 }
    ],
    xAxis: {
      type: "value", min: minPoint - 1, max: maxPoint + 1, minInterval: 1, interval: 1,
      axisLabel: { color: textColor },
      splitLine: { show: true, lineStyle: { color: gridColor, type: 'dashed' } }
    },
    yAxis: {
      type: "value", scale: true, axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } }
    },
    series: series
  };
});

// 2. Map Chart (Heatmap Fix & Horizontal Legend)
const mapChartOption = computed(() => {
  const LIMIT = 175; 
  const GRID_INTERVAL = 25;
  const axisColor = isDarkMode.value ? "#52525b" : "#cbd5e1"; 
  const crossHairColor = isDarkMode.value ? "#71717a" : "#94a3b8";

  let seriesData: any[] = [];
  let visualMapOption: any = null;
  let seriesType = 'scatter'; 

  // [Fix] Heatmap 조회 버그 수정
  if (mapMode.value === 'heatmap' && selectedWaferId.value) {
    seriesType = 'heatmap';
    const targetWafer = chartSeries.value.find(s => s.waferId === selectedWaferId.value);
    
    if (targetWafer) {
      // Data: [x, y, value]
      seriesData = targetWafer.dataPoints.map(p => [p.x, p.y, p.value]);
      const values = targetWafer.dataPoints.map(p => p.value);
      const minVal = values.length > 0 ? Math.min(...values) : 0;
      const maxVal = values.length > 0 ? Math.max(...values) : 100;

      // Horizontal Legend Top Right
      visualMapOption = {
        min: minVal, max: maxVal,
        calculable: true,
        orient: 'horizontal',
        right: 0, top: 0, 
        itemWidth: 10, itemHeight: 80, 
        inRange: { color: ['#3b82f6', '#22c55e', '#ef4444'] },
        textStyle: { color: axisColor, fontSize: 10 }
      };
    }
  } else {
    // Point Mode
    seriesType = 'scatter';
    const uniquePoints = new Set<string>();
    chartSeries.value.forEach(s => {
      s.dataPoints.forEach(p => {
        const key = `${p.point}`;
        if (!uniquePoints.has(key)) {
          uniquePoints.add(key);
          seriesData.push({ value: [p.x, p.y, p.point] });
        }
      });
    });
  }

  return {
    backgroundColor: "transparent",
    visualMap: visualMapOption,
    tooltip: {
      trigger: "item",
      backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
      formatter: (p: any) => {
          const v = p.data.value || p.data; // v = [x, y, val]
          const isHeat = seriesType === 'heatmap';
          return `
            <div class="font-bold mb-1 text-xs border-b pb-1">
              ${isHeat ? `Wafer #${selectedWaferId.value}` : 'Point Location'}
            </div>
            <div class="text-xs mt-1 flex gap-3"><span>X:</span> <span class="font-mono">${v[0].toFixed(1)}</span></div>
            <div class="text-xs flex gap-3"><span>Y:</span> <span class="font-mono">${v[1].toFixed(1)}</span></div>
            <div class="text-xs font-bold text-teal-500 mt-1">
              ${isHeat ? `Value: ${v[2].toFixed(3)}` : `Pt No: ${v[2]}`}
            </div>`;
      }
    },
    grid: { left: 10, right: 10, top: 10, bottom: 10 },
    xAxis: { 
      type: "value", min: -LIMIT, max: LIMIT, interval: GRID_INTERVAL, 
      show: true, axisLabel: { show: false },
      axisLine: { show: true, lineStyle: { color: crossHairColor, width: 2 } },
      splitLine: { show: true, lineStyle: { color: axisColor, type: 'dashed', width: 0.5 } }
    },
    yAxis: { 
      type: "value", min: -LIMIT, max: LIMIT, interval: GRID_INTERVAL, 
      show: true, axisLabel: { show: false },
      axisLine: { show: true, lineStyle: { color: crossHairColor, width: 2 } },
      splitLine: { show: true, lineStyle: { color: axisColor, type: 'dashed', width: 0.5 } }
    },
    series: [
      {
        type: 'line', symbol: 'none',
        lineStyle: { color: isDarkMode.value ? '#333' : '#ddd', width: 2, type: 'solid' },
        data: (() => {
            const d = [];
            for(let i=0; i<=360; i+=2) {
                const rad = i * Math.PI / 180;
                d.push([150 * Math.cos(rad), 150 * Math.sin(rad)]);
            }
            return d;
        })(),
        silent: true 
      },
      {
        name: "Data",
        type: seriesType, 
        symbolSize: 8,
        itemStyle: seriesType === 'scatter' ? { color: '#2dd4bf', borderColor: isDarkMode.value ? '#000' : '#fff', borderWidth: 1 } : undefined,
        pointSize: 35, 
        blurSize: 30,  
        data: seriesData
      }
    ]
  };
});
</script>

<style scoped>
:deep(.p-select), :deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[11px] py-[3px] px-2;
}
:deep(.custom-dropdown.small) {
  @apply h-6;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.date-picker .p-inputtext) {
  @apply !text-[11px] !py-0 !px-2 !h-6;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-5;
}
:deep(.p-select-dropdown svg) {
  @apply w-2.5 h-2.5;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

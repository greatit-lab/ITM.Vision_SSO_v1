<!-- frontend/src/views/PreAlignAnalyticsView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B]"
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
          Precision alignment trend analysis.
        </span>
      </div>
    </div>

    <div
      class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
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
          :loading="isLoading"
          :disabled="!filter.eqpId"
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

    <div
      class="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl animate-fade-in relative"
    >
      <div
        class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0"
      >
        <div class="flex items-center gap-2">
          <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
            Alignment Trend
          </h3>
          <span
            v-if="hasSearched"
            class="text-xs font-medium text-slate-400 dark:text-slate-500 ml-2"
          >
            ({{ chartData.length.toLocaleString() }} points)
          </span>
        </div>
      </div>

      <div class="relative flex-1 w-full min-h-0 group">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
        >
          <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
          <p class="mt-4 text-xs font-medium text-slate-400 animate-pulse">
            Loading Data...
          </p>
        </div>

        <EChart
          v-else-if="hasSearched && chartData.length > 0"
          :option="chartOption"
          class="w-full h-full"
          @chartCreated="onChartCreated"
        />

        <div
          v-else-if="!isLoading && hasSearched && chartData.length === 0"
          class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60"
        >
          <i class="mb-2 text-3xl pi pi-exclamation-circle opacity-30"></i>
          <span class="text-xs">No data found for the selected criteria.</span>
        </div>

        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center opacity-50 select-none"
        >
          <div
            class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
          >
            <i
              class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-chart-line"
            ></i>
          </div>
          <p class="text-sm font-bold text-slate-500">Ready to Analyze</p>
          <p class="mt-1 text-xs text-slate-400">
            Select an equipment and date range to view trends.
          </p>
        </div>

        <transition name="fade">
          <button
            v-if="isZoomed"
            @click="resetZoom"
            class="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-20 cursor-pointer"
          >
            <i class="pi pi-refresh" style="font-size: 0.7rem"></i>
            Reset Zoom
          </button>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { preAlignApi, type PreAlignDataDto } from "@/api/prealign";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";

// Components
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

// --- State ---
const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days ago
  endDate: new Date(),
});

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);

const isLoading = ref(false);
const hasSearched = ref(false);
const chartData = ref<PreAlignDataDto[]>([]);

// Zoom State
const isZoomed = ref(false);
let chartInstance: ECharts | null = null;

// Theme detection
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      isDarkMode.value = document.documentElement.classList.contains("dark");
    }
  });
});

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  themeObserver.disconnect();
});

// --- Handlers ---
const onSiteChange = async () => {
  sdwts.value = filter.site ? await dashboardApi.getSdwts(filter.site) : [];
  filter.sdwt = "";
  filter.eqpId = "";
  eqpIds.value = [];
};

const onSdwtChange = async () => {
  if (filter.sdwt) {
    eqpIds.value = await equipmentApi.getEqpIds(undefined, filter.sdwt);
  } else {
    eqpIds.value = [];
  }
  filter.eqpId = "";
};

const searchEqp = (e: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(e.query.toLowerCase())
  );
};

const search = async () => {
  if (!filter.eqpId || !filter.startDate || !filter.endDate) return;

  isLoading.value = true;
  hasSearched.value = true;
  isZoomed.value = false;

  try {
    const data = await preAlignApi.getData(
      filter.eqpId,
      filter.startDate.toISOString(),
      filter.endDate.toISOString()
    );
    chartData.value = data || [];
  } catch (e) {
    console.error("Failed to load PreAlign data:", e);
    chartData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const reset = () => {
  filter.site = "";
  filter.sdwt = "";
  filter.eqpId = "";
  filter.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  filter.endDate = new Date();

  sdwts.value = [];
  eqpIds.value = [];
  chartData.value = [];
  hasSearched.value = false;
  isZoomed.value = false;
};

// --- Chart Helper (Zoom Event) ---
const onChartCreated = (instance: any) => {
  chartInstance = instance;
  instance.on("dataZoom", () => {
    // 줌 상태 감지 (시작이 0이 아니거나 끝이 100이 아니면 줌 상태)
    const opt = instance.getOption();
    if (opt.dataZoom && opt.dataZoom[0]) {
      const start = opt.dataZoom[0].start;
      const end = opt.dataZoom[0].end;
      // 약간의 오차 허용 (0.1% 미만 차이는 무시)
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

// --- ECharts Config ---
const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  const timestamps = chartData.value.map((d) => formatDate(d.timestamp));
  const xmm = chartData.value.map((d) => d.xmm);
  const ymm = chartData.value.map((d) => d.ymm);
  const notch = chartData.value.map((d) => d.notch);

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
      formatter: (params: any) => {
        if (!params || !params[0]) return "";
        let html = `<div class="font-bold mb-1 border-b border-gray-500 pb-1 text-xs">${params[0].axisValueLabel}</div>`;
        params.forEach((p: any) => {
          const val = p.value !== undefined ? p.value.toFixed(4) : "-";
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:8px;height:8px;background-color:${p.color};"></span>`;
          html += `<div class="flex justify-between gap-4 text-xs mt-1"><span>${colorDot} ${p.seriesName}</span><span class="font-mono font-bold">${val}</span></div>`;
        });
        return html;
      },
    },
    legend: {
      show: true,
      top: 5,
      left: 80, // 좌측 상단 배치
      right: "auto",
      textStyle: { color: textColor },
      itemGap: 15,
      selectedMode: true, // 클릭 시 Hide/Show
    },
    // 마우스 드래그 줌 도구 (우측 상단)
    toolbox: {
      show: true,
      right: 30,
      top: 0,
      feature: {
        dataZoom: {
          yAxisIndex: "none", // X축만 줌 (Y축 고정)
          title: { zoom: "Drag Zoom", back: "Reset Zoom" },
        },
        restore: { show: false }, // 리셋 버튼은 별도 UI로 제공하므로 숨김
        saveAsImage: { title: "Save Image" },
      },
      iconStyle: {
        borderColor: textColor,
      },
    },
    grid: {
      left: 60,
      right: 60,
      top: 50,
      bottom: 80,
      containLabel: false,
    },
    // 마우스 휠, 드래그, 슬라이더 줌 설정
    dataZoom: [
      { type: "inside", xAxisIndex: [0], filterMode: "filter" }, // 마우스 휠
      {
        type: "slider",
        xAxisIndex: [0],
        filterMode: "filter",
        height: 20,
        bottom: 10,
        borderColor: "transparent",
        backgroundColor: isDarkMode.value ? "#18181b" : "#f1f5f9",
      }, // 하단 슬라이더
    ],
    xAxis: {
      type: "category",
      data: timestamps,
      boundaryGap: false,
      axisLabel: {
        color: textColor,
        fontSize: 10,
        rotate: 45,
        hideOverlap: true,
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: [
      {
        type: "value",
        name: "Position (mm)",
        nameTextStyle: {
          color: textColor,
          align: "left",
          padding: [0, 0, 0, -30],
        },
        position: "left",
        min: -0.5,
        max: 0.5,
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: gridColor } },
        axisLine: { show: true, lineStyle: { color: gridColor } },
      },
      {
        type: "value",
        name: "Notch",
        nameTextStyle: {
          color: textColor,
          align: "right",
          padding: [0, -30, 0, 0],
        },
        position: "right",
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { show: false },
        axisLine: { show: true, lineStyle: { color: gridColor } },
      },
    ],
    series: [
      {
        name: "X (mm)",
        type: "line",
        data: xmm,
        yAxisIndex: 0,
        showSymbol: false,
        symbolSize: 4,
        itemStyle: { color: "#3b82f6" },
        lineStyle: { width: 1.5 },
      },
      {
        name: "Y (mm)",
        type: "line",
        data: ymm,
        yAxisIndex: 0,
        showSymbol: false,
        symbolSize: 4,
        itemStyle: { color: "#10b981" },
        lineStyle: { width: 1.5 },
      },
      {
        name: "Notch",
        type: "line",
        data: notch,
        yAxisIndex: 1,
        showSymbol: false,
        symbolSize: 4,
        itemStyle: { color: "#f59e0b" },
        lineStyle: { width: 1.5, type: "dashed" },
      },
    ],
  };
});

// Utils
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
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
</style>

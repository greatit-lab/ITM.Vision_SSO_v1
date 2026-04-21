<!-- frontend/src/views/admin/ServerMonitoringView.vue -->
<template>
  <div class="p-6 bg-slate-50 dark:bg-[#09090b] space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <h1
          class="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100"
        >
          System Infrastructure Monitoring
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Real-time resource usage & 30-day trends
        </p>
      </div>
      <div>
        <button
          @click="fetchData"
          class="flex items-center px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-md shadow-sm dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900"
          :disabled="isLoading"
        >
          <i
            v-if="isLoading"
            class="mr-2 pi pi-spin pi-spinner text-slate-500 dark:text-slate-400"
          ></i>
          <i
            v-else
            class="mr-2 pi pi-refresh text-slate-500 dark:text-slate-400"
          ></i>
          {{ isLoading ? "Updating..." : "Refresh" }}
        </button>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="p-4 text-sm text-red-700 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
    >
      <span class="mr-2 font-bold">Error:</span><span>{{ errorMessage }}</span>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div
        v-for="server in servers"
        :key="server.id"
        class="flex flex-col overflow-hidden transition-all bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 rounded-xl border-slate-200 dark:border-zinc-800 hover:shadow-md"
        :class="{ 'ring-2 ring-indigo-500': activeTab === server.id }"
        @click="activeTab = server.id"
      >
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30"
        >
          <div class="flex items-center space-x-3">
            <i
              class="text-2xl pi pi-server"
              :class="getStatusColor(server.status)"
            ></i>
            <div>
              <h2
                class="text-lg font-semibold text-slate-800 dark:text-slate-100"
              >
                {{ server.name }}
              </h2>
              <p
                class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5"
              >
                {{ server.id }}
              </p>
            </div>
          </div>
          <span
            class="px-2.5 py-1 text-xs font-bold rounded-full"
            :class="getStatusBadgeClass(server.status)"
          >
            {{ server.status.toUpperCase() }}
          </span>
        </div>

        <div class="p-5 space-y-4">
          <div>
            <div class="flex items-end justify-between mb-1">
              <span
                class="text-sm font-medium text-slate-600 dark:text-slate-400"
                >vCPU Usage</span
              >
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200"
                >{{ server.cpu }}%</span
              >
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                class="h-2 transition-all duration-500 rounded-full"
                :class="getProgressBarColor(server.cpu)"
                :style="{ width: `${server.cpu}%` }"
              ></div>
            </div>
            <p
              class="mt-1 text-xs text-right text-slate-400 dark:text-slate-500"
            >
              {{ server.cpuDetails }}
            </p>
          </div>

          <div>
            <div class="flex items-end justify-between mb-1">
              <span
                class="text-sm font-medium text-slate-600 dark:text-slate-400"
                >Memory Usage</span
              >
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200"
                >{{ server.memory }}%</span
              >
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                class="h-2 transition-all duration-500 rounded-full"
                :class="getProgressBarColor(server.memory)"
                :style="{ width: `${server.memory}%` }"
              ></div>
            </div>
            <p
              class="mt-1 text-xs text-right text-slate-400 dark:text-slate-500"
            >
              {{ server.memoryDetails }}
            </p>
          </div>

          <div>
            <div class="flex items-end justify-between mb-1">
              <span
                class="text-sm font-medium text-slate-600 dark:text-slate-400"
                >Disk Usage (Data)</span
              >
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200"
                >{{ server.disk }}%</span
              >
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                class="h-2 transition-all duration-500 rounded-full"
                :class="getProgressBarColor(server.disk)"
                :style="{ width: `${server.disk}%` }"
              ></div>
            </div>
            <p
              class="mt-1 text-xs text-right text-slate-400 dark:text-slate-500"
            >
              {{ server.diskDetails }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="p-5 bg-white border shadow-sm dark:bg-zinc-900 rounded-xl border-slate-200 dark:border-zinc-800"
    >
      <div
        class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800"
      >
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
          <i class="mr-2 text-indigo-500 pi pi-chart-line"></i>
          30-Day Resource Trends :
          <span class="text-indigo-600 dark:text-indigo-400">{{
            getActiveServerName
          }}</span>
        </h2>
      </div>

      <div ref="chartGridRef" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3
              class="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              vCPU
            </h3>
            <div class="flex space-x-1.5 text-[11px] font-mono font-bold">
              <span
                class="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded"
                >Mean: {{ stats.cpu.mean }}%</span
              >
            </div>
          </div>
          <div
            class="relative w-full h-48 overflow-hidden border rounded-lg border-slate-100 dark:border-zinc-800"
          >
            <div ref="cpuChartRef" class="absolute inset-0 w-full h-full"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h3
              class="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Memory
            </h3>
            <div class="flex space-x-1.5 text-[11px] font-mono font-bold">
              <span
                class="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded"
                >Mean: {{ stats.memory.mean }}%</span
              >
            </div>
          </div>
          <div
            class="relative w-full h-48 overflow-hidden border rounded-lg border-slate-100 dark:border-zinc-800"
          >
            <div ref="memChartRef" class="absolute inset-0 w-full h-full"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h3
              class="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Disk
            </h3>
            <div class="flex space-x-1.5 text-[11px] font-mono font-bold">
              <span
                class="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded"
                >Mean: {{ stats.disk.mean }}%</span
              >
            </div>
          </div>
          <div
            class="relative w-full h-48 overflow-hidden border rounded-lg border-slate-100 dark:border-zinc-800"
          >
            <div
              ref="diskChartRef"
              class="absolute inset-0 w-full h-full"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  markRaw,
} from "vue";
import * as echarts from "echarts";
import {
  getServerMetrics,
  getServerTrend,
  type ServerMetrics,
} from "@/api/infra";

const servers = ref<ServerMetrics[]>([]);
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");
const activeTab = ref<string>("db-storage-server");

const chartGridRef = ref<HTMLElement | null>(null);
const cpuChartRef = ref<HTMLElement | null>(null);
const memChartRef = ref<HTMLElement | null>(null);
const diskChartRef = ref<HTMLElement | null>(null);

let cpuChartInstance: echarts.ECharts | null = null;
let memChartInstance: echarts.ECharts | null = null;
let diskChartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

/* =========================
   ✅ 서버 순서 고정 추가
========================= */
const SERVER_ORDER = ["web-server", "api-server", "db-storage-server"];

const sortServers = (list: ServerMetrics[]) => {
  return [...list].sort(
    (a, b) => SERVER_ORDER.indexOf(a.id) - SERVER_ORDER.indexOf(b.id),
  );
};

/* =========================
   기존 함수 (유지 필수)
========================= */
const getStatusColor = (status: string) => {
  if (status === "healthy") return "text-emerald-500 dark:text-emerald-400";
  if (status === "warning") return "text-amber-500 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
};

const getStatusBadgeClass = (status: string) => {
  if (status === "healthy")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
  if (status === "warning")
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
  return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
};

const getProgressBarColor = (value: number) => {
  if (value >= 90) return "bg-rose-500 dark:bg-rose-600";
  if (value >= 75) return "bg-amber-400 dark:bg-amber-500";
  return "bg-indigo-500 dark:bg-indigo-600";
};

const stats = ref({
  cpu: { min: 0, max: 0, mean: 0 },
  memory: { min: 0, max: 0, mean: 0 },
  disk: { min: 0, max: 0, mean: 0 },
});

const getActiveServerName = computed(() => {
  const s = servers.value.find((x) => x.id === activeTab.value);
  return s ? s.name : "Unknown";
});

const calculateStats = (arr: number[]) => {
  if (!arr || arr.length === 0) return { min: 0, max: 0, mean: 0 };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1)),
    mean: Number(mean.toFixed(1)),
  };
};

const renderCharts = async () => {
  if (!activeTab.value) return;

  try {
    const response = await getServerTrend(activeTab.value, 30);
    const trendData = (response as any).data || response;

    if (!trendData || !trendData.dates || trendData.dates.length === 0) return;

    await nextTick();

    stats.value.cpu = calculateStats(trendData.cpu);
    stats.value.memory = calculateStats(trendData.memory);
    stats.value.disk = calculateStats(trendData.disk);

    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#9ca3af" : "#64748b";
    const splitLineColor = isDark ? "#27272a" : "#f1f5f9";

    const commonOptions = (
      title: string,
      color: string,
      xData: string[],
      yData: number[],
    ) => {
      const seriesData = xData.map((timeStr, index) => {
        return [new Date(timeStr).getTime(), yData[index]];
      });

      return {
        tooltip: {
          trigger: "axis",
          backgroundColor: isDark ? "#18181b" : "#fff",
          textStyle: {
            color: isDark ? "#e4e4e7" : "#1e293b",
            fontSize: 11,
          },
          confine: true,
          formatter: (params: any) => {
            const date = new Date(params[0].value[0]);
            const hours = String(date.getUTCHours()).padStart(2, "0");
            const minutes = String(date.getUTCMinutes()).padStart(2, "0");

            let html = `<div style="font-weight:bold;margin-bottom:4px;">${hours}:${minutes}</div>`;
            params.forEach((p: any) => {
              html += `<div>${p.marker} ${p.seriesName}: ${p.value[1]}%</div>`;
            });
            return html;
          },
        },
        grid: {
          left: "3%",
          right: "5%",
          bottom: "5%",
          top: "10%",
          containLabel: true,
        },

        /* =========================
           ✅ X축 수정 (효과 유지)
        ========================= */
        xAxis: {
          type: "time",
          boundaryGap: false,

          // ❌ 기존 제거
          // minInterval: 24 * 60 * 60 * 1000,

          axisLabel: {
            color: textColor,
            fontSize: 10,
            hideOverlap: true, // ⭐ 겹침 방지

            formatter: (value: number) => {
              const date = new Date(value);
              const MM = String(date.getUTCMonth() + 1).padStart(2, "0");
              const DD = String(date.getUTCDate()).padStart(2, "0");
              const HH = String(date.getUTCHours()).padStart(2, "0");
              const mm = String(date.getUTCMinutes()).padStart(2, "0");
              return `${MM}/${DD} ${HH}:${mm}`;
            },
          },

          axisLine: { lineStyle: { color: splitLineColor } },
          splitLine: { show: false },
        },

        yAxis: {
          type: "value",
          max: 100,
          axisLabel: {
            color: textColor,
            formatter: "{value}%",
            fontSize: 10,
          },
          splitLine: {
            lineStyle: { color: splitLineColor, type: "dashed" },
          },
        },

        series: [
          {
            name: title,
            type: "line",
            smooth: true,
            symbol: "none",
            itemStyle: { color },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: color },
                {
                  offset: 1,
                  color: isDark ? "transparent" : "rgba(255,255,255,0)",
                },
              ]),
              opacity: 0.3,
            },
            data: seriesData,
          },
        ],
      };
    };

    if (cpuChartRef.value) {
      if (!cpuChartInstance)
        cpuChartInstance = markRaw(echarts.init(cpuChartRef.value));
      cpuChartInstance.setOption(
        commonOptions("vCPU", "#6366f1", trendData.dates, trendData.cpu),
      );
    }
    if (memChartRef.value) {
      if (!memChartInstance)
        memChartInstance = markRaw(echarts.init(memChartRef.value));
      memChartInstance.setOption(
        commonOptions("Memory", "#10b981", trendData.dates, trendData.memory),
      );
    }
    if (diskChartRef.value) {
      if (!diskChartInstance)
        diskChartInstance = markRaw(echarts.init(diskChartRef.value));
      diskChartInstance.setOption(
        commonOptions("Disk", "#f43f5e", trendData.dates, trendData.disk),
      );
    }
  } catch (error) {
    console.error("차트 렌더링 실패", error);
  }
};

const fetchData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await getServerMetrics();
    const raw = (res as any).data || res;

    // ⭐ 서버 순서 적용
    servers.value = sortServers(raw);

    if (
      servers.value.length > 0 &&
      !servers.value.find((s) => s.id === activeTab.value)
    ) {
      activeTab.value = servers.value[0]?.id || "";
    }
  } catch (error) {
    errorMessage.value =
      "백엔드 API에 연결할 수 없습니다. 데이터를 확인해주세요.";
  } finally {
    isLoading.value = false;
    renderCharts();
  }
};

watch(activeTab, renderCharts);

onMounted(() => {
  fetchData();

  resizeObserver = new ResizeObserver(() => {
    cpuChartInstance?.resize();
    memChartInstance?.resize();
    diskChartInstance?.resize();
  });

  if (chartGridRef.value) {
    resizeObserver.observe(chartGridRef.value);
  }

  window.addEventListener("resize", () => {
    cpuChartInstance?.resize();
    memChartInstance?.resize();
    diskChartInstance?.resize();
  });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  cpuChartInstance?.dispose();
  memChartInstance?.dispose();
  diskChartInstance?.dispose();
});
</script>

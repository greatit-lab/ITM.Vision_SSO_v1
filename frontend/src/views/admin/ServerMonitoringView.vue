<!-- frontend/src/views/admin/ServerMonitoringView.vue -->
<template>
  <div class="p-6 bg-slate-50 dark:bg-[#09090b] space-y-6">
    
    <!-- 1. 헤더 영역 -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">System Infrastructure Monitoring</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time resource usage & 30-day trends</p>
      </div>
      <div>
        <button 
          @click="fetchData" 
          class="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 flex items-center transition-colors"
          :disabled="isLoading"
        >
          <i v-if="isLoading" class="pi pi-spin pi-spinner mr-2 text-slate-500 dark:text-slate-400"></i>
          <i v-else class="pi pi-refresh mr-2 text-slate-500 dark:text-slate-400"></i>
          {{ isLoading ? 'Updating...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm">
      <span class="font-bold mr-2">Error:</span><span>{{ errorMessage }}</span>
    </div>

    <!-- 2. 실시간 모니터링 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="server in servers" 
        :key="server.id" 
        class="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-all hover:shadow-md cursor-pointer"
        :class="{'ring-2 ring-indigo-500': activeTab === server.id}"
        @click="activeTab = server.id"
      >
        <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/30">
          <div class="flex items-center space-x-3">
            <i class="pi pi-server text-2xl" :class="getStatusColor(server.status)"></i>
            <div>
              <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ server.name }}</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{{ server.ip }}</p>
            </div>
          </div>
          <span class="px-2.5 py-1 text-xs font-bold rounded-full" :class="getStatusBadgeClass(server.status)">
            {{ server.status.toUpperCase() }}
          </span>
        </div>
        
        <div class="p-5 space-y-4">
          <!-- vCPU Usage -->
          <div>
            <div class="flex justify-between items-end mb-1">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">vCPU Usage</span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ server.cpu }}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500" :class="getProgressBarColor(server.cpu)" :style="{ width: `${server.cpu}%` }"></div>
            </div>
          </div>
          
          <!-- Memory Usage -->
          <div>
            <div class="flex justify-between items-end mb-1">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Memory Usage</span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ server.memory }}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500" :class="getProgressBarColor(server.memory)" :style="{ width: `${server.memory}%` }"></div>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{{ server.memoryDetails }}</p>
          </div>

          <!-- Disk Usage (Data) -->
          <div>
            <div class="flex justify-between items-end mb-1">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Disk Usage (Data)</span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ server.disk }}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500" :class="getProgressBarColor(server.disk)" :style="{ width: `${server.disk}%` }"></div>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{{ server.diskDetails }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 30일 기준 트렌드 영역 -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5">
      
      <div class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
          <i class="pi pi-chart-line mr-2 text-indigo-500"></i>
          30-Day Resource Trends : <span class="text-indigo-600 dark:text-indigo-400">{{ getActiveServerName }}</span>
        </h2>
      </div>

      <div ref="chartGridRef" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- vCPU Trend -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">vCPU</h3>
            <div class="flex space-x-1.5 text-[11px] font-mono font-bold">
              <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded">MIN: {{ stats.cpu.min }}</span>
              <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded">MAX: {{ stats.cpu.max }}</span>
              <span class="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded">Mean: {{ stats.cpu.mean }}</span>
            </div>
          </div>
          <div class="w-full h-48 relative border border-slate-100 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div ref="cpuChartRef" class="absolute inset-0 w-full h-full"></div>
          </div>
        </div>

        <!-- Memory Trend -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Memory</h3>
            <div class="flex space-x-1.5 text-[11px] font-mono font-bold">
              <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded">MIN: {{ stats.memory.min }}</span>
              <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded">MAX: {{ stats.memory.max }}</span>
              <span class="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded">Mean: {{ stats.memory.mean }}</span>
            </div>
          </div>
          <div class="w-full h-48 relative border border-slate-100 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div ref="memChartRef" class="absolute inset-0 w-full h-full"></div>
          </div>
        </div>

        <!-- Disk Trend -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Disk</h3>
            <div class="flex space-x-1.5 text-[11px] font-mono font-bold">
              <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded">MIN: {{ stats.disk.min }}</span>
              <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded">MAX: {{ stats.disk.max }}</span>
              <span class="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded">Mean: {{ stats.disk.mean }}</span>
            </div>
          </div>
          <div class="w-full h-48 relative border border-slate-100 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div ref="diskChartRef" class="absolute inset-0 w-full h-full"></div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, markRaw } from 'vue';
import * as echarts from 'echarts'; 
import { getServerMetrics, getServerTrend, type ServerMetrics } from '@/api/infra';

// --- State ---
const servers = ref<ServerMetrics[]>([]);
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>('');
const activeTab = ref<string>('web-01');
let pollingInterval: number | null = null;

const chartGridRef = ref<HTMLElement | null>(null);
const cpuChartRef = ref<HTMLElement | null>(null);
const memChartRef = ref<HTMLElement | null>(null);
const diskChartRef = ref<HTMLElement | null>(null);

let cpuChartInstance: echarts.ECharts | null = null;
let memChartInstance: echarts.ECharts | null = null;
let diskChartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const stats = ref({
  cpu: { min: 0, max: 0, mean: 0 },
  memory: { min: 0, max: 0, mean: 0 },
  disk: { min: 0, max: 0, mean: 0 }
});

const getActiveServerName = computed(() => {
  const s = servers.value.find(x => x.id === activeTab.value);
  return s ? s.name : '';
});

// --- UI Helpers ---
const getStatusColor = (status: string) => {
  if(status === 'healthy') return 'text-emerald-500 dark:text-emerald-400';
  if(status === 'warning') return 'text-amber-500 dark:text-amber-400';
  return 'text-rose-500 dark:text-rose-400';
};
const getStatusBadgeClass = (status: string) => {
  if(status === 'healthy') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
  if(status === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
  return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
};
const getProgressBarColor = (value: number) => {
  if (value >= 90) return 'bg-rose-500 dark:bg-rose-600';
  if (value >= 75) return 'bg-amber-400 dark:bg-amber-500';
  return 'bg-indigo-500 dark:bg-indigo-600';
};

const calculateStats = (arr: number[]) => {
  if (!arr || arr.length === 0) return { min: 0, max: 0, mean: 0 };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return { min: Number(min.toFixed(1)), max: Number(max.toFixed(1)), mean: Number(mean.toFixed(1)) };
};

// --- Chart Rendering (백엔드 API 연동) ---
const renderCharts = async () => {
  if (!activeTab.value) return;

  try {
    const response = await getServerTrend(activeTab.value, 30);
    const trendData = (response as any).data || response;

    if (!trendData || !trendData.dates || trendData.dates.length === 0) {
      console.warn("트렌드 데이터가 없습니다.");
      return;
    }

    await nextTick(); 

    stats.value.cpu = calculateStats(trendData.cpu);
    stats.value.memory = calculateStats(trendData.memory);
    stats.value.disk = calculateStats(trendData.disk);

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#9ca3af' : '#64748b';
    const splitLineColor = isDark ? '#27272a' : '#f1f5f9';

    const commonOptions = (title: string, color: string, xData: string[], yData: number[]) => ({
      tooltip: { trigger: 'axis', backgroundColor: isDark ? '#18181b' : '#fff', textStyle: { color: isDark ? '#e4e4e7' : '#1e293b', fontSize: 11 }, confine: true },
      grid: { left: '3%', right: '5%', bottom: '5%', top: '10%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: xData, axisLabel: { color: textColor, fontSize: 10 }, axisLine: { lineStyle: { color: splitLineColor } } },
      yAxis: { type: 'value', max: 100, axisLabel: { color: textColor, formatter: '{value}%', fontSize: 10 }, splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } } },
      series: [{
        name: title,
        type: 'line',
        smooth: true,
        symbol: 'none',
        itemStyle: { color },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color },
            { offset: 1, color: isDark ? 'transparent' : 'rgba(255,255,255,0)' }
          ]),
          opacity: 0.3
        },
        data: yData
      }]
    });

    if (cpuChartRef.value) {
      if (!cpuChartInstance) cpuChartInstance = markRaw(echarts.init(cpuChartRef.value));
      cpuChartInstance.setOption(commonOptions('vCPU', '#6366f1', trendData.dates, trendData.cpu));
    }
    if (memChartRef.value) {
      if (!memChartInstance) memChartInstance = markRaw(echarts.init(memChartRef.value));
      memChartInstance.setOption(commonOptions('Memory', '#10b981', trendData.dates, trendData.memory));
    }
    if (diskChartRef.value) {
      if (!diskChartInstance) diskChartInstance = markRaw(echarts.init(diskChartRef.value));
      diskChartInstance.setOption(commonOptions('Disk', '#f43f5e', trendData.dates, trendData.disk));
    }
  } catch (error) {
    console.error("차트 데이터를 렌더링하는데 실패했습니다.", error);
  }
};

const handleResize = () => {
  cpuChartInstance?.resize();
  memChartInstance?.resize();
  diskChartInstance?.resize();
};

// --- API Calls ---
const fetchData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const res = await getServerMetrics();
    servers.value = (res as any).data || res;
  } catch (error) {
    errorMessage.value = "백엔드 API에 연결할 수 없습니다. 데이터를 확인해주세요.";
  } finally {
    isLoading.value = false;
    renderCharts();
  }
};

// --- Watchers & Lifecycle ---
watch(activeTab, () => {
  renderCharts();
});

onMounted(() => {
  fetchData();
  pollingInterval = window.setInterval(fetchData, 10000);
  
  // [수정됨] chartGridRef 값이 정상적으로 읽히고 동작하도록 ResizeObserver 로직 활성화
  resizeObserver = new ResizeObserver(() => {
    handleResize();
  });
  if (chartGridRef.value) {
    resizeObserver.observe(chartGridRef.value);
  }
  
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
  window.removeEventListener('resize', handleResize);
  
  // [수정됨] 언마운트 시 옵저버 해제 누수 방지
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  
  cpuChartInstance?.dispose();
  memChartInstance?.dispose();
  diskChartInstance?.dispose();
});
</script>

<!-- frontend/src/views/admin/StorageUsageView.vue -->
<template>
  <div class="flex flex-col h-full gap-3 p-3 font-sans transition-colors duration-500 overflow-hidden bg-[#F8FAFC] dark:bg-[#09090B]">
    
    <div class="flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 bg-white border shadow-sm rounded-lg dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <i class="text-lg text-indigo-600 pi pi-database dark:text-indigo-400"></i>
        </div>
        <div>
          <h1 class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Storage & DB Analytics
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-1.5 p-1 bg-white border rounded-lg shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800">
        <DatePicker v-model="startDate" showIcon showClear dateFormat="yy-mm-dd" placeholder="Start" class="w-[130px] custom-dropdown small date-picker" />
        <span class="text-xs text-slate-400">-</span>
        <DatePicker v-model="endDate" showIcon showClear dateFormat="yy-mm-dd" placeholder="End" class="w-[130px] custom-dropdown small date-picker" />
        
        <div class="flex items-center gap-1 ml-1 border-l pl-1.5 border-slate-200 dark:border-zinc-700">
          <Button icon="pi pi-search" class="!w-7 !h-7 !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 !p-0" @click="fetchData" :loading="isLoading" v-tooltip.top="'조회'" />
          <Button icon="pi pi-download" class="!w-7 !h-7 !bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 !p-0" @click="exportDataToCSV" :disabled="isLoading || dailyTrendData.length === 0" v-tooltip.top="'CSV 다운로드'" />
          <Button icon="pi pi-sync" label="동기화" class="!h-7 !bg-blue-600 !border-blue-600 hover:!bg-blue-700 !px-2.5 !py-0 !text-[11px] font-bold ml-1" @click="triggerSync" :loading="isSyncing" v-tooltip.top="'전일 데이터 즉시 동기화'" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 shrink-0">
      <div class="flex items-center justify-between p-3 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg dark:bg-indigo-900/30">
            <i class="text-lg text-indigo-600 pi pi-server dark:text-indigo-400"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-bold text-slate-700 dark:text-slate-200">Total Database Size</span>
            <span class="text-[11px] text-slate-400 dark:text-zinc-500">Targeted specific tables & monthly tables</span>
          </div>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ formatSize(summaryData.totalDbUsageMB).value }}</span>
          <span class="text-xs font-bold text-slate-400">{{ formatSize(summaryData.totalDbUsageMB).unit }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between p-3 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 bg-teal-50 rounded-lg dark:bg-teal-900/30">
            <i class="text-lg text-teal-600 pi pi-cloud dark:text-teal-400"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-bold text-slate-700 dark:text-slate-200">Object Storage Size</span>
            <span class="text-[11px] text-slate-400 dark:text-zinc-500">Uploaded files, logs, and images</span>
          </div>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ formatSize(summaryData.totalObjectStorageMB).value }}</span>
          <span class="text-xs font-bold text-slate-400">{{ formatSize(summaryData.totalObjectStorageMB).unit }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-3 h-[240px] shrink-0">
      <div class="flex flex-col col-span-4 p-3 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800">
        <h3 class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          <i class="text-indigo-500 pi pi-calendar"></i> Monthly Growth Trend
        </h3>
        <div class="flex-1 w-full min-h-0">
          <EChart v-if="!isLoading && monthlyTrendData.length > 0" :option="monthlyChartOption" />
          <div v-else-if="!isLoading" class="flex flex-col items-center justify-center h-full text-xs text-slate-400">
            <i class="mb-2 text-xl opacity-50 pi pi-info-circle"></i><span>No data</span>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col col-span-8 p-3 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800">
        <h3 class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          <i class="text-teal-500 pi pi-chart-line"></i> Daily Actuals & Cumulative
        </h3>
        <div class="flex-1 w-full min-h-0 relative group">
          <EChart v-if="!isLoading && dailyTrendData.length > 0" :option="dailyChartOption" @chartCreated="onDailyChartCreated" />
          <div v-else-if="!isLoading" class="flex flex-col items-center justify-center h-full text-xs text-slate-400">
            <i class="mb-2 text-xl opacity-50 pi pi-info-circle"></i><span>No data</span>
          </div>
          
          <transition name="fade">
            <button v-if="isZoomed" @click="resetDailyZoom" class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-30">
              <i class="pi pi-refresh" style="font-size: 0.7rem"></i> Reset Zoom
            </button>
          </transition>
        </div>
      </div>
    </div>

    <div class="grid flex-1 grid-cols-12 gap-3 min-h-0">
      <div class="flex flex-col col-span-4 p-3 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800">
        <div class="flex items-center justify-between mb-2">
          <h3 class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <i class="text-indigo-500 pi pi-chart-pie"></i> Database Distribution
          </h3>
          <span class="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400" title="날짜 필터와 무관하게 현재 상태를 보여줍니다.">
            <i class="pi pi-info-circle text-[10px]"></i> 실시간 현재 기준
          </span>
        </div>
        <div class="flex-1 w-full min-h-0">
          <EChart v-if="tableData.length > 0" :option="pieChartOption" />
          <div v-else class="flex flex-col items-center justify-center h-full text-xs text-slate-400">
            <i class="mb-2 text-xl opacity-50 pi pi-info-circle"></i><span>No data</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col col-span-8 p-0 overflow-hidden bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800">
        <div class="flex items-center justify-between p-3 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shrink-0">
          <h3 class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <i class="text-indigo-500 pi pi-table"></i> Physical Table Sizes & Rows
          </h3>
          <span class="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400">
            <i class="pi pi-info-circle text-[10px]"></i> 실시간 현재 기준
          </span>
        </div>
        <div class="flex-1 overflow-auto custom-scrollbar">
          <table class="w-full text-xs text-left table-fixed text-slate-600 dark:text-slate-400">
            <colgroup>
              <col class="w-[30%]" />
              <col class="w-[15%]" />
              <col class="w-[20%]" />
              <col class="w-[15%]" />
              <col class="w-[20%]" />
            </colgroup>
            <thead class="uppercase bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm text-[10px]">
              <tr>
                <th class="px-3 py-2 font-bold border-b border-slate-200 dark:border-zinc-800">Table Name</th>
                <th class="px-3 py-2 font-bold text-center border-b border-slate-200 dark:border-zinc-800">Type</th>
                <th class="px-3 py-2 font-bold text-right border-b border-slate-200 dark:border-zinc-800">Rows</th>
                <th class="px-3 py-2 font-bold text-right border-b border-slate-200 dark:border-zinc-800">Size</th>
                <th class="px-3 py-2 font-bold text-center border-b border-slate-200 dark:border-zinc-800">%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr v-if="tableData.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400">No tables discovered yet.</td>
              </tr>
              <tr v-for="item in tableData" :key="item.tableName" class="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                <td class="px-3 py-2 font-mono font-bold truncate text-slate-700 dark:text-slate-300" :title="item.tableName">{{ item.tableName }}</td>
                <td class="px-3 py-2 text-center">
                  <span class="px-1.5 py-0.5 text-[9px] font-bold rounded-full whitespace-nowrap" :class="item.type === 'Static' ? 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'">
                    {{ item.type }}
                  </span>
                </td>
                <td class="px-3 py-2 font-mono text-right text-slate-600 dark:text-slate-300">{{ item.rowCount.toLocaleString() }}</td>
                <td class="px-3 py-2 font-mono font-bold text-right text-indigo-600 dark:text-indigo-400">
                  {{ formatSize(item.sizeMB).value }} <span class="text-[9px] font-sans text-slate-400 ml-0.5">{{ formatSize(item.sizeMB).unit }}</span>
                </td>
                <td class="px-3 py-2 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <div class="w-12 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      <div class="h-full bg-indigo-500 rounded-full" :style="`width: ${summaryData.totalDbUsageMB ? ((item.sizeMB / summaryData.totalDbUsageMB) * 100).toFixed(1) : 0}%`"></div>
                    </div>
                    <span class="w-8 font-mono text-[10px] text-right shrink-0">{{ summaryData.totalDbUsageMB ? ((item.sizeMB / summaryData.totalDbUsageMB) * 100).toFixed(1) : '0.0' }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import { adminApi, syncStorageNow } from "@/api/admin";
import dayjs from "dayjs";

const isLoading = ref(false);
const isSyncing = ref(false);

const isZoomed = ref(false);
let dailyChartInstance: ECharts | null = null;

const today = new Date();
const lastMonth = new Date();
lastMonth.setMonth(today.getMonth() - 1);

const startDate = ref(lastMonth);
const endDate = ref(today);

const summaryData = ref({ totalDbUsageMB: 0, totalObjectStorageMB: 0 });
const tableData = ref<any[]>([]);
const dailyTrendData = ref<any[]>([]);
const monthlyTrendData = ref<any[]>([]);

const isDarkMode = ref(document.documentElement.classList.contains("dark"));

const formatSize = (mb: number) => {
  if (!mb || isNaN(mb) || mb === 0) return { value: "0.00", unit: "MB" };
  if (mb < 1024) return { value: mb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), unit: "MB" };
  return { value: (mb / 1024).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), unit: "GB" };
};

// [개선] 동기화 실행 함수 (중복 응답 처리)
const triggerSync = async () => {
  isSyncing.value = true;
  try {
    const response = await syncStorageNow();
    const resData = response.data || response;
    
    // 백엔드에서 전달된 성공/중단 메시지를 사용자에게 알림
    alert(resData.message || '스토리지 수동 동기화 요청이 완료되었습니다.');
    
    // DB에 데이터가 없어서 실제로 동기화가 이루어졌을(success: true) 때만 데이터를 새로고침함
    if (resData.success !== false) {
      await fetchData();
    }
  } catch (error: any) {
    console.error("Failed to sync storage", error);
    alert("동기화 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    isSyncing.value = false;
  }
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const startStr = dayjs(startDate.value).format("YYYY-MM-DD");
    const endStr = dayjs(endDate.value).format("YYYY-MM-DD");
    
    const response = await adminApi.getStorageUsage(startStr, endStr, 'daily');
    const resData = response.data || response;
    
    summaryData.value = {
      totalDbUsageMB: resData?.summary?.totalDbUsageMB || 0,
      totalObjectStorageMB: resData?.summary?.totalObjectStorageMB || 0,
    };
    tableData.value = resData?.tableDetails || [];
    dailyTrendData.value = resData?.dailyTrends || [];
    monthlyTrendData.value = resData?.monthlyTrends || [];
    
    if (isZoomed.value) resetDailyZoom();
  } catch (error) {
    console.error("Failed to fetch storage usage", error);
  } finally {
    isLoading.value = false;
  }
};

const exportDataToCSV = () => {
  try {
    let csvContent = '\uFEFF';

    const startStr = dayjs(startDate.value).format("YYYY-MM-DD");
    const endStr = dayjs(endDate.value).format("YYYY-MM-DD");

    csvContent += `[Daily Storage Trends (${startStr} ~ ${endStr})]\n`;
    csvContent += "Date,Total DB Usage (MB),Total Object Storage (MB),Daily Object Input (MB)\n";
    
    dailyTrendData.value.forEach((row) => {
      csvContent += `${row.date},${Number(row.cumDbMB).toFixed(2)},${Number(row.cumObjMB).toFixed(2)},${Number(row.dailyObjMB).toFixed(2)}\n`;
    });

    csvContent += "\n\n";

    csvContent += "[Real-time Table Snapshot]\n";
    csvContent += "Table Name,Table Type,Row Count,Size (MB),Percentage (%)\n";
    
    tableData.value.forEach((row) => {
      const percentage = summaryData.value.totalDbUsageMB 
        ? ((row.sizeMB / summaryData.value.totalDbUsageMB) * 100).toFixed(2) 
        : "0.00";
      csvContent += `${row.tableName},${row.type},${row.rowCount},${Number(row.sizeMB).toFixed(2)},${percentage}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Storage_Analytics_${dayjs(startDate.value).format("YYYYMMDD")}_${dayjs(endDate.value).format("YYYYMMDD")}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export CSV", error);
  }
};

onMounted(() => {
  fetchData();
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDarkMode.value = document.documentElement.classList.contains("dark");
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

const onDailyChartCreated = (instance: any) => {
  dailyChartInstance = instance;
  instance.on("dataZoom", (params: any) => {
    const batch = params.batch?.[0] || params;
    if (batch) {
      isZoomed.value = batch.start !== 0 || batch.end !== 100;
    }
  });
};

const resetDailyZoom = () => {
  if (dailyChartInstance) {
    dailyChartInstance.dispatchAction({ type: "restore" });
    isZoomed.value = false;
  }
};

const monthlyChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  return {
    backgroundColor: "transparent",
    tooltip: { 
      trigger: "axis", 
      axisPointer: { type: "shadow" }, 
      backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)", 
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0", 
      textStyle: { color: textColor, fontSize: 11 },
      formatter: function (params: any) { 
        let html = `<div class="pb-1 mb-1 font-bold border-b border-gray-500">${params[0].name}</div>`; 
        params.forEach((p: any) => { 
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`; 
          html += `<div class="flex justify-between items-center gap-4 text-[10px] mb-0.5"><span>${colorDot} ${p.seriesName}</span><span class="font-mono font-bold">${Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GB</span></div>`; 
        }); 
        return html; 
      }
    },
    legend: { textStyle: { color: textColor, fontSize: 10 }, top: 0, right: 15, itemGap: 10 },
    grid: { left: 45, right: 10, top: 35, bottom: 25 },
    xAxis: { type: "category", data: monthlyTrendData.value.map((d) => d.date), axisLabel: { color: textColor, fontSize: 10 }, axisLine: { lineStyle: { color: gridColor } } },
    yAxis: { type: "value", name: "(GB)", nameTextStyle: { color: textColor, fontSize: 10, padding: [0,20,0,0] }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
    series: [
      { name: "DB Usage", type: "bar", barMaxWidth: 20, itemStyle: { color: "rgba(99, 102, 241, 0.8)", borderRadius: [2, 2, 0, 0] }, data: monthlyTrendData.value.map((d) => (Number(d.monthlyDbMB || 0) / 1024).toFixed(2)) },
      { name: "Obj Input", type: "bar", barMaxWidth: 20, itemStyle: { color: "rgba(20, 184, 166, 0.8)", borderRadius: [2, 2, 0, 0] }, data: monthlyTrendData.value.map((d) => (Number(d.monthlyObjMB || 0) / 1024).toFixed(2)) }
    ]
  };
});

const dailyChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  
  return {
    backgroundColor: "transparent",
    dataZoom: [{ type: "inside", xAxisIndex: [0], filterMode: "filter" }],
    tooltip: { 
      trigger: "axis", 
      axisPointer: { type: "cross" }, 
      backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)", 
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0", 
      textStyle: { color: textColor, fontSize: 11 }, 
      formatter: function (params: any) { 
        let html = `<div class="pb-1 mb-1 font-bold border-b border-gray-500">${params[0].name}</div>`; 
        params.forEach((p: any) => { 
          const unit = p.seriesName.includes("Cum.") ? "GB" : "MB";
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`; 
          html += `<div class="flex justify-between items-center gap-4 text-[10px] mb-0.5"><span>${colorDot} ${p.seriesName}</span><span class="font-mono font-bold">${Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</span></div>`; 
        }); 
        return html; 
      } 
    },
    legend: { textStyle: { color: textColor, fontSize: 10 }, top: 0, right: 85, itemGap: 15 },
    grid: { left: 55, right: 45, top: 35, bottom: 25 },
    xAxis: { 
      type: "category", 
      data: dailyTrendData.value.map((d) => d.date), 
      axisLabel: { color: textColor, fontSize: 10 }, 
      axisLine: { lineStyle: { color: gridColor } } 
    },
    yAxis: [
      { 
        type: "value", 
        name: "Cum. (GB)", 
        nameTextStyle: { color: textColor, padding: [0, 0, 0, 10], fontSize: 10 }, 
        axisLabel: { color: textColor, fontSize: 10 }, 
        splitLine: { lineStyle: { color: gridColor } } 
      },
      { 
        type: "value", 
        name: "Daily (MB)", 
        nameTextStyle: { color: textColor, padding: [0, 10, 0, 0], fontSize: 10 }, 
        axisLabel: { color: textColor, fontSize: 10 }, 
        splitLine: { show: false } 
      },
    ],
    series: [
      { name: "Cum. DB Usage", type: "line", yAxisIndex: 0, smooth: true, showSymbol: false, itemStyle: { color: "#6366f1" }, lineStyle: { width: 2 }, data: dailyTrendData.value.map((d) => (Number(d.cumDbMB) / 1024).toFixed(2)) },
      { name: "Cum. Object", type: "line", yAxisIndex: 0, smooth: true, showSymbol: false, itemStyle: { color: "#14b8a6" }, lineStyle: { width: 2 }, data: dailyTrendData.value.map((d) => (Number(d.cumObjMB) / 1024).toFixed(2)) },
      { name: "Daily DB Usage", type: "bar", yAxisIndex: 1, barWidth: "20%", itemStyle: { color: "rgba(99, 102, 241, 0.7)", borderRadius: [2, 2, 0, 0] }, data: dailyTrendData.value.map((d) => Number(d.dailyDbMB || 0).toFixed(2)) },
      { name: "Daily Obj Input", type: "bar", yAxisIndex: 1, barWidth: "20%", itemStyle: { color: "rgba(20, 184, 166, 0.7)", borderRadius: [2, 2, 0, 0] }, data: dailyTrendData.value.map((d) => Number(d.dailyObjMB || 0).toFixed(2)) },
    ],
  };
});

const pieChartOption = computed(() => {
  const topTables = tableData.value.slice(0, 5);
  const others = tableData.value.slice(5);
  const othersSize = others.reduce((sum, t) => sum + t.sizeMB, 0);
  const pieData = topTables.map((t) => ({ name: t.tableName, value: t.sizeMB }));
  if (othersSize > 0) pieData.push({ name: "Others", value: othersSize });
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";

  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)", borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0", textStyle: { color: textColor, fontSize: 12 }, formatter: (params: any) => { const sizeInfo = formatSize(params.value); return `<div class="pb-1 mb-1 font-bold border-b border-gray-500">${params.name}</div>${sizeInfo.value} ${sizeInfo.unit} (${params.percent}%)`; } },
    legend: { orient: "vertical", right: "5%", top: "middle", textStyle: { color: textColor, fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    series: [
      { name: "Table Size", type: "pie", radius: ["40%", "70%"], center: ["35%", "50%"], avoidLabelOverlap: true, itemStyle: { borderRadius: 4, borderColor: isDarkMode.value ? "#111111" : "#ffffff", borderWidth: 2 }, label: { show: false }, color: ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#94a3b8"], data: pieData },
    ],
  };
});
</script>

<style scoped>
:deep(.p-datepicker .p-inputtext) {
  @apply !text-[12px] !py-1 !px-2 !h-7 !bg-transparent !border-0 text-slate-700 dark:text-slate-200 shadow-none focus:ring-0;
}
:deep(.custom-dropdown.small) {
  @apply !bg-slate-50 dark:!bg-zinc-900/50 !border-slate-200 dark:!border-zinc-800 rounded-md shadow-none;
}
:deep(.custom-dropdown.small .p-inputtext) {
  @apply !text-[12px] !h-7 !py-0 !flex !items-center;
}
:deep(.p-datepicker-trigger) {
  @apply !w-7 !h-7;
}
:deep(.p-datepicker-trigger svg) {
  @apply !w-3 !h-3;
}
:deep(.p-datepicker-clear-icon) {
  @apply !text-[9px] !right-8;
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

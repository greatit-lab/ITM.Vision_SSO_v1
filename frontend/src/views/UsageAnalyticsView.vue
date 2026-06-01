<!-- frontend/src/views/UsageAnalyticsView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden pb-1"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i class="text-lg text-indigo-600 pi pi-chart-pie dark:text-indigo-400"></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Usage Analytics
          </h1>
          <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
            System utilization and user access activity monitoring.
          </span>
        </div>
      </div>
    </div>

    <div
      class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm transition-colors duration-300 shrink-0"
    >
      <div class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide">
        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
        <span class="text-slate-400 dark:text-zinc-600 font-bold">-</span>
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
        <Button
          v-if="hasSearched && filteredLogs.length > 0 && !isExportDisabled"
          icon="pi pi-file-excel"
          rounded
          outlined
          v-tooltip.bottom="'Export to CSV'"
          class="!text-emerald-600 !border-emerald-600 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20 !w-8 !h-8 !text-xs"
          @click="exportCSV"
        />
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 !w-8 !h-8 !text-xs"
          @click="searchData"
          :disabled="isLoading"
        />
      </div>
    </div>

    <div v-if="hasSearched" class="flex-1 flex flex-col gap-3 min-h-0 animate-fade-in relative">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        <div class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div class="flex-1 min-w-0 pr-2">
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Active Users</p>
            <div class="flex items-end gap-2">
              <h4 class="text-xl font-black text-slate-800 dark:text-white truncate leading-none">{{ kpiData.totalUsers }}</h4>
              <span v-if="kpiData.usersDelta !== undefined" :class="kpiData.usersDelta >= 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'" class="px-1.5 py-0.5 rounded text-[9px] font-bold mb-0.5 flex items-center gap-0.5"><i :class="kpiData.usersDelta >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" style="font-size: 0.4rem"></i>{{ Math.abs(kpiData.usersDelta) }}%</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0"><i class="pi pi-users text-lg text-blue-500"></i></div>
        </div>

        <div class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div class="flex-1 min-w-0 pr-2">
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Web Visits</p>
            <div class="flex items-end gap-2">
              <h4 class="text-xl font-black text-slate-800 dark:text-white truncate leading-none">{{ kpiData.totalVisits }}</h4>
              <span v-if="kpiData.visitsDelta !== undefined" :class="kpiData.visitsDelta >= 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'" class="px-1.5 py-0.5 rounded text-[9px] font-bold mb-0.5 flex items-center gap-0.5"><i :class="kpiData.visitsDelta >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" style="font-size: 0.4rem"></i>{{ Math.abs(kpiData.visitsDelta) }}%</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0"><i class="pi pi-globe text-lg text-teal-500"></i></div>
        </div>

        <div class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div class="flex-1 min-w-0 pr-2">
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Page Views</p>
            <div class="flex items-end gap-2">
              <h4 class="text-xl font-black text-slate-800 dark:text-white truncate leading-none">{{ kpiData.totalViews }}</h4>
              <span v-if="kpiData.viewsDelta !== undefined" :class="kpiData.viewsDelta >= 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'" class="px-1.5 py-0.5 rounded text-[9px] font-bold mb-0.5 flex items-center gap-0.5"><i :class="kpiData.viewsDelta >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" style="font-size: 0.4rem"></i>{{ Math.abs(kpiData.viewsDelta) }}%</span>
            </div>
          </div>
          <div class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0"><i class="pi pi-eye text-lg text-emerald-500"></i></div>
        </div>

        <div class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div class="flex-1 min-w-0 pr-2">
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Most Popular Page</p>
            <h4 class="text-base font-black text-slate-800 dark:text-white truncate" :title="formatMenuName(kpiData.topPage)">{{ formatMenuName(kpiData.topPage) }}</h4>
          </div>
          <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0"><i class="pi pi-star text-lg text-purple-500"></i></div>
        </div>
      </div>

      <div class="flex-[1.2] grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div class="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-2.5 flex flex-col relative min-h-0">
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 px-1 flex items-center gap-2 shrink-0"><i class="pi pi-users text-indigo-500"></i> Daily User & Visit Trend</h3>
          <div class="flex-1 w-full relative min-h-0 cursor-pointer" v-tooltip.top="'Click a date point to filter logs'">
            <EChart v-if="trendChartOption" :option="trendChartOption" class="absolute inset-0 w-full h-full" @chartCreated="onTrendChartCreated" />
          </div>
        </div>

        <div class="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-2.5 flex flex-col relative min-h-0">
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 px-1 flex items-center gap-2 shrink-0"><i class="pi pi-sitemap text-emerald-500"></i> Page Access Trend</h3>
          <div class="flex-1 w-full relative min-h-0">
            <EChart v-if="pageTrendChartOption" :option="pageTrendChartOption" class="absolute inset-0 w-full h-full" />
          </div>
        </div>
      </div>

      <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div class="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div class="flex items-center justify-between px-3 h-8 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0">
            <div class="flex items-center gap-2">
              <i class="text-xs text-indigo-500 pi pi-list"></i>
              <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                Recent Access Logs ({{ filteredLogs.length }})
                <transition name="fade">
                  <button v-if="selectedDateFilter" @click="clearDateFilter" class="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" v-tooltip.top="'Clear date filter'">
                    <i class="pi pi-filter-slash text-[9px]"></i> {{ selectedDateFilter }}
                  </button>
                </transition>
              </h3>
            </div>
            <Paginator v-if="filteredLogs.length > 0" v-model:first="firstRow" v-model:rows="rowsPerPage" :totalRecords="filteredLogs.length" :rowsPerPageOptions="[5, 10, 20, 50]" template="RowsPerPageDropdown PrevPageLink CurrentPageReport NextPageLink" currentPageReportTemplate="{currentPage} / {totalPages}" class="custom-top-paginator" />
          </div>

          <div class="flex-1 relative min-h-0">
            <div class="absolute inset-0 p-1">
              <DataTable :value="paginatedLogs" :paginator="false" class="p-datatable-sm w-full h-full text-xs" stripedRows scrollable scrollHeight="flex" emptyMessage="No log data found for this period.">
                <Column field="time" header="접속일시" style="width: 25%">
                  <template #body="slotProps">
                    <div class="flex items-center gap-1.5"><i class="pi pi-clock text-[9px] text-slate-400"></i><span class="font-mono text-slate-400 dark:text-slate-500 text-[10px]">{{ slotProps.data.time.split(' ')[0] }}</span><span class="font-mono font-bold text-slate-700 dark:text-slate-200 text-[11px]">{{ slotProps.data.time.split(' ')[1] }}</span></div>
                  </template>
                </Column>
                <Column field="loginId" header="User ID" style="width: 25%">
                  <template #body="slotProps">
                    <div class="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors group" @click="openMessenger(slotProps.data.loginId)" v-tooltip.top="'Click to send message'">
                      <div class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0"><i class="pi pi-user text-[8px] text-indigo-500"></i></div>
                      <span class="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">{{ slotProps.data.loginId }}</span><i class="pi pi-comment text-[9px] text-slate-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"></i>
                    </div>
                  </template>
                </Column>
                <Column field="menu" header="Accessed Page" style="width: 50%">
                  <template #body="slotProps">
                    <span class="font-bold text-slate-600 dark:text-slate-300">{{ formatMenuName(slotProps.data.menu) }}</span>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-2.5 flex flex-col relative min-h-0">
          <div class="flex items-center justify-between shrink-0 mb-1 px-1">
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><i class="pi pi-chart-bar text-indigo-500"></i> Page Utilization Ranking</h3>
            <transition name="fade">
              <button v-if="hiddenRankingMenus.length > 0" @click="resetHiddenMenus" class="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" v-tooltip.top="'Click to restore hidden bars'">
                <i class="pi pi-eye text-[9px]"></i> Restore {{ hiddenRankingMenus.length }} hidden
              </button>
            </transition>
          </div>
          <div class="flex-1 w-full relative min-h-0 cursor-pointer">
            <EChart v-if="rankingChartOption" :option="rankingChartOption" class="absolute inset-0 w-full h-full" @chartCreated="onRankingChartCreated" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-0">
      <div class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"><i class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-search"></i></div>
      <p class="text-sm font-bold text-slate-500">Ready to Analyze Usage</p>
      <p class="mt-1 text-xs text-slate-400">Select Date Range to view system utilization statistics.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { adminApi } from "@/api/admin";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Paginator from "primevue/paginator";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";

const authStore = useAuthStore();

// 🌟 Export 권한 체크 로직
const isExportDisabled = computed(() => {
  const role = authStore.user?.role?.toUpperCase();
  return role === 'VIEWER' || role === 'GUEST';
});

const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

const startDate = ref(sevenDaysAgo);
const endDate = ref(now);

const hasSearched = ref(false);
const isLoading = ref(false);

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const kpiData = ref<any>({ totalUsers: 0, totalVisits: 0, totalViews: 0, topPage: "-", viewsDelta: 0, usersDelta: 0, visitsDelta: 0, });
const mockLogs = ref<any[]>([]);
const trendData = ref({ dates: [] as string[], views: [] as number[], users: [] as number[], visits: [] as number[] });
const rankingData = ref({ menus: [] as string[], views: [] as number[] });
const dailyMenuTrendData = ref<any[]>([]);

const firstRow = ref(0);
const rowsPerPage = ref(5);

const hiddenRankingMenus = ref<string[]>([]);
let rankingChartInst: ECharts | null = null;
let trendChartInst: ECharts | null = null;
const selectedDateFilter = ref<string | null>(null);

const clearDateFilter = () => { selectedDateFilter.value = null; firstRow.value = 0; };

const filteredLogs = computed(() => {
  if (!selectedDateFilter.value) return mockLogs.value;
  return mockLogs.value.filter((log) => { const logDate = log.time.substring(5, 10); return logDate === selectedDateFilter.value; });
});

const paginatedLogs = computed(() => {
  return filteredLogs.value.slice(firstRow.value, firstRow.value + rowsPerPage.value);
});

const formatMenuName = (name: string) => {
  if (!name || name === "-") return "-";
  const customNames: Record<string, string> = { wafer: "Wafer Flat Data", "lot-uniformity": "Lot Uniformity Trend", spectrum: "Spectrum Analytics", "process-matching": "Process Matching", equipment: "Equipment Explorer", performance: "Performance Trend", "process-memory": "Process Memory", lamp: "Lamp Life", prealign: "Pre-Align Analytics", error: "Error Analytics", health: "Equipment Health", "optical-trend": "Optical Trend", "agent-memory": "ITM Agent Memory", "usage-analytics": "Usage Analytics", };
  return customNames[name] || name;
};

const openMessenger = (userId: string) => { if (userId) window.location.href = `mysingleim://${userId}`; };

const exportCSV = () => {
  if (isExportDisabled.value) return; // 🌟 함수 방어 로직 유지
  if (!filteredLogs.value.length) return;
  let csvContent = "\uFEFF"; csvContent += "Timestamp,Login ID,Accessed Page\n";
  filteredLogs.value.forEach((row: any) => {
    const safeMenu = formatMenuName(row.menu).replace(/"/g, '""');
    csvContent += `"${row.time}","${row.loginId}","${safeMenu}"\n`;
  });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `IVision_Usage_Analytics_${toLocalISOString(new Date()).slice(0, 10)}.csv`);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

watch([() => startDate.value, () => endDate.value], ([newStart, newEnd], [oldStart, oldEnd]) => {
  if (newStart && newEnd) {
    const startMs = newStart.getTime(); const endMs = newEnd.getTime();
    if (startMs > endMs) { if (startMs !== oldStart?.getTime()) endDate.value = new Date(newStart); else if (endMs !== oldEnd?.getTime()) startDate.value = new Date(newEnd); }
  }
});

onMounted(() => {
  themeObserver = new MutationObserver((mutations) => { mutations.forEach((mutation) => { if (mutation.attributeName === "class") isDarkMode.value = document.documentElement.classList.contains("dark"); }); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  searchData();
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
  if (rankingChartInst) rankingChartInst.off('click');
  if (trendChartInst) trendChartInst.off('click');
});

const toLocalISOString = (date: Date, isEndDate: boolean = false) => {
  if (!date) return ""; const d = new Date(date);
  if (isEndDate) d.setHours(23, 59, 59, 999); else d.setHours(0, 0, 0, 0);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 19).replace("T", " ");
};

const searchData = async () => {
  isLoading.value = true; hasSearched.value = true; firstRow.value = 0; hiddenRankingMenus.value = []; selectedDateFilter.value = null;
  try {
    const startStr = toLocalISOString(startDate.value); const endStr = toLocalISOString(endDate.value, true);
    const data = await adminApi.getUsageAnalytics(startStr, endStr);
    kpiData.value = data.kpi; mockLogs.value = data.recentLogs;
    trendData.value.dates = data.dailyTrend.map((d: any) => d.date); trendData.value.views = data.dailyTrend.map((d: any) => d.views); trendData.value.users = data.dailyTrend.map((d: any) => d.users); trendData.value.visits = data.dailyTrend.map((d: any) => d.visits);
    dailyMenuTrendData.value = data.dailyMenuTrend || [];
    const menuData = data.menuUtilization.slice().reverse(); rankingData.value.menus = menuData.map((d: any) => formatMenuName(d.menu)); rankingData.value.views = menuData.map((d: any) => d.views);
  } catch (error) { console.error("Failed to fetch usage analytics:", error); } finally { isLoading.value = false; }
};

const onTrendChartCreated = (instance: ECharts) => {
  trendChartInst = instance; trendChartInst.off('click');
  trendChartInst.on('click', (params: any) => { if (params.name) { selectedDateFilter.value = params.name; firstRow.value = 0; } });
};

const trendChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569"; const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  return {
    backgroundColor: "transparent", tooltip: { trigger: "axis" }, legend: { show: true, top: 0, textStyle: { color: textColor, fontSize: 10 } }, grid: { left: 45, right: 45, top: 45, bottom: 20 },
    xAxis: { type: "category", data: trendData.value.dates, axisLabel: { color: textColor, fontSize: 10 }, axisLine: { lineStyle: { color: gridColor } }, },
    yAxis: [ { type: "value", name: "Visits", nameTextStyle: { color: textColor, fontSize: 10, align: 'left', padding: [0, 0, 5, 0] }, minInterval: 1, splitLine: { lineStyle: { color: gridColor } }, axisLabel: { color: textColor, fontSize: 10 }, max: (value: any) => Math.max(5, Math.ceil(value.max * 1.8)) }, { type: "value", name: "Users", nameTextStyle: { color: textColor, fontSize: 10, align: 'right', padding: [0, 0, 5, 0] }, minInterval: 1, splitLine: { show: false }, axisLabel: { show: false }, max: (value: any) => Math.max(5, Math.ceil(value.max * 1.2)) } ],
    series: [ { name: "Web Visits (세션)", type: "bar", yAxisIndex: 0, data: trendData.value.visits, itemStyle: { color: "#14b8a6", borderRadius: [4, 4, 0, 0] }, label: { show: true, position: "top", color: textColor, fontSize: 10, fontWeight: "normal", } }, { name: "Active Users (순수 방문자)", type: "line", yAxisIndex: 1, smooth: true, symbol: "circle", symbolSize: 6, showSymbol: true, data: trendData.value.users, itemStyle: { color: "#6366f1" }, lineStyle: { width: 3 }, label: { show: true, position: "top", color: "#6366f1", fontSize: 11, fontWeight: "normal", distance: 5 } }, ],
  };
});

const pageTrendChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569"; const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const topMenus = [...rankingData.value.menus].reverse(); const colors = [ "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f43f5e", "#84cc16", "#6366f1", "#14b8a6", ];
  const series = topMenus.map((menu: string, index: number) => { const data = trendData.value.dates.map((date) => { const record = dailyMenuTrendData.value.find((d: any) => d.date === date && formatMenuName(d.menu) === menu,); return record ? record.views : 0; }); return { name: menu, type: "line", smooth: true, symbolSize: 4, itemStyle: { color: colors[index % colors.length] ?? "#3b82f6" }, data, }; });
  return {
    backgroundColor: "transparent", tooltip: { trigger: "axis" }, legend: { type: "scroll", orient: "vertical", right: 0, top: "middle", textStyle: { color: textColor, fontSize: 10, width: 110, overflow: "truncate" }, itemGap: 12, }, grid: { left: 40, right: 140, top: 20, bottom: 20 },
    xAxis: { type: "category", data: trendData.value.dates, axisLabel: { color: textColor, fontSize: 10 }, axisLine: { lineStyle: { color: gridColor } }, }, yAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: gridColor } }, axisLabel: { color: textColor, fontSize: 10 }, }, series,
  };
});

const rankingChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569"; const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const filteredMenus: string[] = []; const filteredViews: number[] = [];
  rankingData.value.menus.forEach((menu, index) => { if (!hiddenRankingMenus.value.includes(menu)) { filteredMenus.push(menu); filteredViews.push(rankingData.value.views[index] ?? 0); } });
  return {
    backgroundColor: "transparent", tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, grid: { left: 130, right: 20, top: 10, bottom: 20 },
    xAxis: { type: "value", minInterval: 1, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } }, }, yAxis: { type: "category", data: filteredMenus, axisLabel: { color: textColor, fontSize: 10, width: 120, overflow: "truncate" }, axisLine: { show: false }, axisTick: { show: false }, },
    series: [ { name: "Views", type: "bar", data: filteredViews, itemStyle: { color: function (params: any) { const colors = ["#94a3b8", "#8b5cf6", "#f59e0b", "#0ea5e9", "#ec4899"]; return colors[params.dataIndex % colors.length] ?? "#94a3b8"; }, borderRadius: [0, 4, 4, 0], }, label: { show: true, position: "right", color: textColor, fontSize: 10, fontWeight: "normal" }, }, ],
  };
});

const onRankingChartCreated = (instance: ECharts) => {
  rankingChartInst = instance; rankingChartInst.off('click');
  rankingChartInst.on('click', (params: any) => { const clickedMenu = params.name; if (clickedMenu && !hiddenRankingMenus.value.includes(clickedMenu)) hiddenRankingMenus.value.push(clickedMenu); });
};
const resetHiddenMenus = () => { hiddenRankingMenus.value = []; };
</script>

<style scoped>
:deep(.p-select), :deep(.custom-dropdown) { @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors; }
:deep(.custom-dropdown .p-select-label) { @apply text-[13px] py-[5px] px-3; }
:deep(.date-picker .p-inputtext) { @apply !text-[13px] !py-1 !px-2 !h-7; }
:deep(.custom-dropdown.small) { @apply h-7; }
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.p-select-dropdown) { @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none; }
:deep(.p-datatable-header) { @apply !bg-transparent !p-0 !border-0; }
:deep(.p-datatable-thead > tr > th) { @apply !bg-slate-50 dark:!bg-zinc-800/80 !text-slate-500 dark:!text-slate-400 !font-bold !text-[10px] uppercase !py-2.5 !border-b !border-slate-100 dark:!border-zinc-700 z-10 sticky top-0; }
:deep(.p-datatable-tbody > tr > td) { @apply !py-1.5 !border-b !border-slate-50 dark:!border-zinc-800/50 !bg-white dark:!bg-[#111111]; }
:deep(.p-datatable-striped-rows .p-datatable-tbody > tr:nth-child(even) > td) { @apply !bg-slate-50/50 dark:!bg-zinc-900/30; }
:deep(.p-datatable-tbody > tr:hover > td) { @apply !bg-slate-50 dark:!bg-zinc-900/50 transition-colors; }
:deep(.custom-top-paginator) { @apply !bg-transparent !p-0 !m-0 !border-0 text-xs h-full flex items-center; }
:deep(.custom-top-paginator .p-paginator-element) { @apply !min-w-[24px] !h-6 !text-xs !p-0 !m-0 !text-slate-500 dark:!text-slate-400; }
:deep(.custom-top-paginator .p-paginator-current) { @apply !h-6 !leading-6 !px-2 !text-[11px] !text-slate-500 dark:!text-slate-400 font-bold; }
:deep(.custom-top-paginator .p-select), :deep(.custom-top-paginator .p-dropdown) { @apply !h-6 !text-[10px] !items-center !border-slate-200 dark:!border-zinc-700 !bg-white dark:!bg-zinc-800 !mr-2 !rounded; }
:deep(.custom-top-paginator .p-select .p-select-label), :deep(.custom-top-paginator .p-dropdown .p-dropdown-label) { @apply !p-0 !px-2 !text-[10px] !font-bold !leading-6; }
:deep(.p-select-overlay), :deep(.p-dropdown-panel) { @apply !rounded-md !border !border-slate-200 dark:!border-zinc-700 !bg-white dark:!bg-zinc-900 shadow-lg; }
:deep(.p-select-list), :deep(.p-dropdown-items) { @apply !py-1; }
:deep(.p-paginator-dropdown-panel .p-select-option), :deep(.p-dropdown-panel .p-dropdown-item), :deep(.p-select-option) { @apply !text-[10px] !py-1 !px-2 !min-h-0 !leading-4; }
:deep(.p-paginator-dropdown-panel .p-select-option:hover), :deep(.p-dropdown-panel .p-dropdown-item:hover), :deep(.p-select-option:hover) { @apply !bg-slate-100 dark:!bg-zinc-800; }
:deep(.p-paginator-dropdown-panel .p-select-option.p-select-option-selected), :deep(.p-dropdown-panel .p-dropdown-item.p-highlight), :deep(.p-select-option.p-select-option-selected) { @apply !bg-indigo-50 dark:!bg-indigo-900/30 !text-indigo-600 dark:!text-indigo-300; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

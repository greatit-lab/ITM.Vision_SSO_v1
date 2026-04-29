<!-- frontend/src/views/LampLifeView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B]"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i class="text-lg text-amber-500 pi pi-sun dark:text-amber-400"></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Lamp Lifetime
          </h1>
          <span
            class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >
            Consumable parts lifecycle monitoring & process variations.
          </span>
        </div>
      </div>

      <div class="flex items-center p-1 bg-slate-200 dark:bg-zinc-800 rounded-lg">
        <button 
          @click="viewMode = 'eqp'"
          :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-all', viewMode === 'eqp' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200']"
        >
          <i class="pi pi-server mr-1"></i> By Equipment
        </button>
        <button 
          @click="viewMode = 'prc'"
          :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-all', viewMode === 'prc' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200']"
        >
          <i class="pi pi-sitemap mr-1"></i> By Process Group
        </button>
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
    >
      <div class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1">
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

        <div
          v-if="filter.status"
          class="flex items-center gap-2 px-3 py-1 ml-2 text-xs font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 animate-fade-in"
        >
          <i class="pi pi-filter text-[10px]"></i>
          Filtered by: {{ filter.status }}
          <button
            @click="setStatusFilter(null)"
            class="ml-1 hover:text-rose-500"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-amber-500 !border-amber-500 hover:!bg-amber-600 !w-8 !h-8 !text-xs"
          @click="fetchData"
          :loading="isLoading"
          :disabled="!filter.site"
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
      v-if="hasSearched"
      class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-4 shrink-0 animate-fade-in"
    >
      <div
        @click="setStatusFilter(null)"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200"
        :class="{
          'ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-zinc-950': filter.status === null,
        }"
      >
        <p class="text-[10px] font-bold tracking-wider uppercase text-slate-400">Total Monitored</p>
        <div class="flex items-end gap-2 mt-1">
          <span class="text-2xl font-black text-slate-800 dark:text-white">{{ kpi.total.toLocaleString() }}</span>
          <span class="mb-1 text-[10px] text-slate-400">units</span>
        </div>
        <div class="absolute right-2 top-2 opacity-10">
          <i class="text-4xl text-slate-500 pi pi-list"></i>
        </div>
      </div>

      <div
        @click="setStatusFilter('Critical')"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-rose-200 dark:border-rose-900/30 rounded-xl group hover:scale-[1.02] transition-all duration-200"
        :class="{
          'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-zinc-950': filter.status === 'Critical',
        }"
      >
        <div class="absolute inset-0 transition-opacity opacity-50 bg-rose-50 dark:bg-rose-900/10 group-hover:opacity-100"></div>
        <div class="relative z-10">
          <p class="text-[10px] font-bold tracking-wider uppercase text-rose-500 dark:text-rose-400 flex items-center gap-1">
            <i class="pi pi-exclamation-triangle"></i> Critical / Replace
          </p>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-2xl font-black text-rose-600 dark:text-rose-400">{{ kpi.critical.toLocaleString() }}</span>
            <span class="mb-1 text-[10px] text-rose-400/70">units</span>
          </div>
        </div>
      </div>

      <div
        @click="setStatusFilter('Warning')"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-amber-200 dark:border-amber-900/30 rounded-xl hover:scale-[1.02] transition-all duration-200"
        :class="{
          'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-zinc-950': filter.status === 'Warning',
        }"
      >
        <p class="text-[10px] font-bold tracking-wider uppercase text-amber-500 dark:text-amber-400">Warning Zone</p>
        <div class="flex items-end gap-2 mt-1">
          <span class="text-2xl font-black text-amber-600 dark:text-amber-400">{{ kpi.warning.toLocaleString() }}</span>
          <span class="mb-1 text-[10px] text-amber-400/70">units</span>
        </div>
      </div>

      <div
        @click="setStatusFilter('Good')"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl hover:scale-[1.02] transition-all duration-200"
        :class="{
          'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950': filter.status === 'Good',
        }"
      >
        <p class="text-[10px] font-bold tracking-wider uppercase text-emerald-500 dark:text-emerald-400">Healthy</p>
        <div class="flex items-end gap-2 mt-1">
          <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ kpi.good.toLocaleString() }}</span>
          <span class="mb-1 text-[10px] text-emerald-400/70">units</span>
        </div>
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex flex-col h-[625px] shrink-0 lg:flex-row gap-4 overflow-hidden animate-fade-in"
    >
      <div class="flex flex-col w-full lg:w-1/3 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <h3 class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <i :class="viewMode === 'eqp' ? 'pi pi-chart-bar text-rose-500' : 'pi pi-chart-pie text-indigo-500'"></i> 
            {{ viewMode === 'eqp' ? 'Worst 10 Lamps' : 'Average Usage by Process' }}
          </h3>
          <span class="text-[10px] text-slate-400">
            {{ viewMode === 'eqp' ? '*Global Ranking (Top 10)' : '*Aggregated Average' }}
          </span>
        </div>
        <div class="relative flex-1 w-full min-h-0">
          <EChart v-if="filteredLamps.length > 0" :option="chartOption" />
          <div v-else class="flex items-center justify-center h-full text-xs text-slate-400">
            No data available
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 w-full lg:w-2/3 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl">
        <div class="flex items-center justify-between px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0">
          <div class="flex items-center gap-2">
            <i class="text-slate-400 pi pi-list"></i>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Lamp Status Details</h3>
          </div>
          <span class="text-[10px] text-slate-400">{{ filteredLamps.length }} records</span>
        </div>

        <div class="relative w-full flex-1 min-h-0">
          <DataTable
            :value="sortedData"
            :paginator="false" 
            rowGroupMode="subheader" 
            groupRowsBy="prc_group" 
            sortMode="single" 
            sortField="prc_group" 
            :sortOrder="1" 
            class="absolute inset-0 text-xs p-datatable-sm custom-header-group"
            stripedRows
            scrollable
            scrollHeight="flex"
          >
            <template #empty>
              <div class="flex flex-col items-center justify-center h-full text-slate-400">
                <span class="text-xs">No lamp data found.</span>
              </div>
            </template>

            <template #groupheader="slotProps">
              <div class="flex items-center gap-2 py-1">
                <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded font-black text-[11px] uppercase tracking-wider">
                  {{ slotProps.data.prc_group }}
                </span>
                <span class="text-slate-400 font-medium text-[10px]">Process Group</span>
              </div>
            </template>

            <Column field="eqpId" header="EQP ID" style="min-width: 100px">
              <template #body="{ data }">
                <span class="font-bold text-slate-700 dark:text-slate-200">{{ data.eqpId }}</span>
              </template>
            </Column>

            <Column field="lampId" header="Lamp ID" style="min-width: 100px">
              <template #body="{ data }">
                <span class="font-mono text-slate-700 dark:text-slate-200">{{ data.lampId }}</span>
              </template>
            </Column>

            <Column field="lastChanged" header="Last Changed" style="min-width: 140px">
              <template #body="{ data }">
                <span class="font-mono text-slate-500">{{ formatDate(data.lastChanged) }}</span>
              </template>
            </Column>

            <Column field="usageRatio" header="Life Usage" style="min-width: 200px">
              <template #body="{ data }">
                <div class="flex flex-col gap-1 w-full">
                  <div class="flex justify-between text-[10px]">
                    <span class="font-mono text-indigo-600 dark:text-indigo-400" v-tooltip.top="'Includes Offset correction'">{{ data.ageHour.toLocaleString() }} hrs</span>
                    <span class="text-slate-400">Limit: {{ data.lifespanHour.toLocaleString() }}</span>
                  </div>
                  <div class="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="getProgressColor(data.usageRatio)"
                      :style="{ width: Math.min(data.usageRatio, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="status" header="Status" style="min-width: 100px" alignFrozen="right" frozen>
              <template #body="{ data }">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold border" :class="getStatusBadgeClass(data.status)">
                  {{ data.status }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 min-h-[400px] opacity-50 select-none">
      <div class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800">
        <i class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-hourglass"></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Lamp Health Check</p>
      <p class="mt-1 text-xs text-slate-400">Select Site/SDWT to view lamp status.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { getLampLifeStatus, type LampLife } from "@/api/lamp";
import EChart from "@/components/common/EChart.vue";
import dayjs from "dayjs";

import Select from "primevue/select";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

interface LampDisplay extends LampLife {
  usageRatio: number;
  status: string;
  prc_group: string; 
  offsetHour?: number; // 오프셋 속성 추가
}

const authStore = useAuthStore();
const LS_KEYS = {
  SITE: "lamplife-view-site",
  SDWT: "lamplife-view-sdwt",
};

const filter = reactive({
  site: "",
  sdwt: "",
  status: null as string | null,
});

const viewMode = ref<'eqp' | 'prc'>('eqp');
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const allLamps = ref<LampDisplay[]>([]);
const isLoading = ref(false);
const hasSearched = ref(false);

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const parseSafeDate = (ts: string | Date | undefined | null): dayjs.Dayjs => {
  let str = String(ts || "");
  if (str.includes("Z")) str = str.replace("Z", ""); 
  if (/^\d{2}-\d{2}-\d{2}/.test(str)) {
      str = "20" + str;
  }
  return dayjs(str);
};

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  let targetSite = "";
  let targetSdwt = "";

  if (authStore.user?.site) {
    targetSite = authStore.user.site;
    targetSdwt = authStore.user.sdwt || "";
  } else {
    targetSite = localStorage.getItem(LS_KEYS.SITE) || "";
    targetSdwt = localStorage.getItem(LS_KEYS.SDWT) || "";
  }

  if (targetSite && sites.value.includes(targetSite)) {
    filter.site = targetSite;
    try {
      sdwts.value = await dashboardApi.getSdwts(targetSite);
      if (targetSdwt && sdwts.value.includes(targetSdwt)) {
        filter.sdwt = targetSdwt;
        fetchData();
      } else {
        filter.sdwt = "";
      }
    } catch (e) {
      console.error("Failed to load SDWTs during init:", e);
    }
  } else {
    filter.site = "";
    filter.sdwt = "";
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

watch(() => filter.site, (newVal) => {
  if (newVal) localStorage.setItem(LS_KEYS.SITE, newVal);
  else localStorage.removeItem(LS_KEYS.SITE);
});

watch(() => filter.sdwt, (newVal) => {
  if (newVal) localStorage.setItem(LS_KEYS.SDWT, newVal);
  else localStorage.removeItem(LS_KEYS.SDWT);
});

const onSiteChange = async () => {
  if (filter.site) {
    sdwts.value = await dashboardApi.getSdwts(filter.site);
  } else {
    sdwts.value = [];
  }
  filter.sdwt = "";
  hasSearched.value = false;
  allLamps.value = [];
};

const onSdwtChange = () => {
  if (filter.sdwt) {
    fetchData();
  } else {
    hasSearched.value = false;
    allLamps.value = [];
  }
};

const setStatusFilter = (status: string | null) => {
  filter.status = filter.status === status ? null : status;
};

const fetchData = async () => {
  isLoading.value = true;
  hasSearched.value = true;
  try {
    const res = await getLampLifeStatus({
      site: filter.site,
      sdwt: filter.sdwt,
    });
    const rawData = res.data || [];
    const now = dayjs(); 

    allLamps.value = rawData.map((l: any) => {
      let calculatedAge = l.ageHour || 0; 
      
      // 👨‍💻 [수정] 버전 파편화에 완벽 대응하는 보정 로직 적용
      // 1. 기존처럼 "현재 시각 - 마지막 교체 시간" 계산을 유지
      // 2. 에이전트가 오프셋 보정값을 보내주었다면 해당 값(Offset_hour)을 결과에 더해 정합성을 확보
      if (l.lastChanged) {
        const lastChangedDate = parseSafeDate(l.lastChanged);
        if (lastChangedDate.isValid()) {
          const timeDiff = now.diff(lastChangedDate, 'hour');
          const offset = l.offsetHour ? Number(l.offsetHour) : 0;
          calculatedAge = timeDiff + offset;
        }
      }
      calculatedAge = Math.max(0, calculatedAge);
      const limit = l.lifespanHour || 0;
      const ratio = limit > 0 ? (calculatedAge / limit) * 100 : 0;

      return {
        ...l,
        prc_group: l.prcGroup || l.prc_group || 'UNKNOWN',
        ageHour: calculatedAge, 
        usageRatio: ratio,
        status: getStatus(calculatedAge, limit),
      };
    });
  } catch (e) {
    console.error(e);
    allLamps.value = [];
  } finally {
    isLoading.value = false;
  }
};

const reset = () => {
  hasSearched.value = false;
  filter.site = "";
  filter.sdwt = "";
  filter.status = null;
  allLamps.value = [];
};

const getStatus = (age: number, lifespan: number) => {
  const ratio = lifespan > 0 ? age / lifespan : 0;
  if (ratio >= 0.95) return "Critical";
  if (ratio >= 0.8) return "Warning";
  return "Good";
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = parseSafeDate(dateString);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : dateString;
};

const filteredLamps = computed(() => {
  let data = [...allLamps.value];
  if (filter.status) {
    data = data.filter((d) => d.status === filter.status);
  }
  return data;
});

const kpi = computed(() => {
  return {
    total: allLamps.value.length,
    critical: allLamps.value.filter((d) => d.status === "Critical").length,
    warning: allLamps.value.filter((d) => d.status === "Warning").length,
    good: allLamps.value.filter((d) => d.status === "Good").length,
  };
});

const sortedData = computed(() => {
  return [...filteredLamps.value].sort((a, b) => a.prc_group.localeCompare(b.prc_group));
});

const processGroupData = computed(() => {
  const groups = filteredLamps.value.reduce((acc, curr) => {
    const key = curr.prc_group || 'UNKNOWN';
    const group = acc[key] || { sumRatio: 0, count: 0 };
    
    group.sumRatio += curr.usageRatio;
    group.count += 1;
    acc[key] = group;
    
    return acc;
  }, {} as Record<string, { sumRatio: number; count: number }>);

  return Object.keys(groups).map(key => {
    const group = groups[key];
    return {
      prc_group: key,
      avgRatio: (group && group.count > 0) ? (group.sumRatio / group.count) : 0
    };
  }).sort((a, b) => b.avgRatio - a.avgRatio);
});

const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  if (viewMode.value === 'eqp') {
    const data = [...filteredLamps.value].sort((a, b) => b.usageRatio - a.usageRatio).slice(0, 10);
    const categories = data.map((d) => `${d.eqpId} (${d.lampId})`);
    const values = data.map((d) => d.usageRatio);

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          if (!p || typeof p.dataIndex === 'undefined') return "";
          const item = data[p.dataIndex];
          if (!item) return "";
          return `<div class="font-bold mb-1">${item.eqpId} <span style="font-weight:normal; opacity:0.7">(${item.lampId})</span></div><div class="text-xs">Age: ${item.ageHour.toLocaleString()} / ${item.lifespanHour.toLocaleString()} hrs</div><div class="text-xs font-bold mt-1">Ratio: ${item.usageRatio.toFixed(2)}%</div>`;
        },
      },
      grid: { containLabel: true, left: "2%", right: "5%", top: 10, bottom: 10 },
      xAxis: {
        type: "value",
        min: (value: any) => Math.max(0, Math.floor(value.min - 5)),
        axisLabel: { color: textColor, fontSize: 10, formatter: "{value}%" },
        splitLine: { show: false },
      },
      yAxis: {
        type: "category",
        data: categories,
        axisLabel: { color: textColor, fontSize: 10, align: "right", margin: 10 },
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: values,
          barWidth: 20,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params: any) => {
              const val = params.value;
              if (val >= 95) return "#f43f5e";
              if (val >= 80) return "#f59e0b";
              return "#10b981";
            },
          },
          label: {
            show: true,
            position: "insideRight",
            formatter: (params: any) => `${Number(params.value).toFixed(2)}%`,
            fontSize: 10,
            color: "#fff",
            fontWeight: "bold",
            padding: [0, 5, 0, 0],
          },
        },
      ],
    };
  } else {
    const data = processGroupData.value;
    const categories = data.map(d => d.prc_group);
    const values = data.map(d => d.avgRatio);

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          if (!p) return "";
          const name = p.name || '';
          const val = p.value !== undefined && p.value !== null ? Number(p.value).toFixed(2) : '0.00';
          return `<div class="font-bold mb-1">${name} Process</div><div class="text-xs">Avg Life Usage: <b>${val}%</b></div>`;
        }
      },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: textColor, fontSize: 10, fontWeight: 'bold' },
        axisLine: { lineStyle: { color: gridColor } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor, fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: gridColor } }
      },
      series: [{
        type: 'bar',
        data: values,
        barMaxWidth: 40,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params: any) => {
             const val = params.value;
             if (val >= 95) return "#f43f5e";
             if (val >= 80) return "#f59e0b";
             return "#6366f1";
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => `${Number(params.value).toFixed(1)}%`,
          color: textColor,
          fontSize: 10,
          fontWeight: 'bold'
        }
      }]
    };
  }
});

const getProgressColor = (ratio: number) => {
  if (ratio >= 95) return "bg-rose-500";
  if (ratio >= 80) return "bg-amber-500";
  return "bg-emerald-500";
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Critical":
      return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30";
    case "Warning":
      return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30";
    case "Good":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30";
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
};
</script>

<style scoped>
:deep(.p-datatable-thead > tr > th) {
  @apply font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-700 z-10 sticky top-0;
}
:deep(.p-datatable-tbody > tr > td) {
  @apply py-2 px-3 text-[12px] text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800/50;
}
:deep(.p-rowgroup-header > td) {
  @apply !bg-slate-50/80 dark:!bg-zinc-900/80 !border-b !border-slate-200 dark:!border-zinc-700 !py-1.5;
}
:deep(.p-datatable-tbody > tr:not(.p-rowgroup-header):hover) {
  @apply !bg-[#27272a] !text-white transition-colors cursor-pointer;
}
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
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
:deep(.p-select-dropdown svg) {
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

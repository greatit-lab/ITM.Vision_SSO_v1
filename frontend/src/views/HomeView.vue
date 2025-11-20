<template>
  <div class="p-8 min-h-screen transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-3">
          Dashboard
          <span v-if="hasSearched" class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold tracking-wide uppercase border border-indigo-200 dark:border-indigo-500/20 fade-in">Live</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium text-sm">Overview of system performance.</p>
      </div>

      <button 
        @click="toggleDarkMode" 
        class="relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none border-2 border-slate-200 dark:border-zinc-700"
        :class="isDark ? 'bg-zinc-800' : 'bg-slate-100'"
      >
        <div class="w-full flex justify-between px-2.5 z-0">
          <i class="pi pi-sun text-[10px] text-slate-400 dark:text-zinc-500"></i>
          <i class="pi pi-moon text-[10px] text-slate-400 dark:text-zinc-500"></i>
        </div>
        <div 
          class="absolute top-0.5 w-7 h-7 bg-white dark:bg-zinc-600 rounded-full shadow-sm transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center z-10 border border-slate-100 dark:border-zinc-500"
          :class="isDark ? 'translate-x-[30px]' : 'translate-x-0.5'"
        >
          <i class="pi text-[10px]" :class="isDark ? 'pi-moon text-white' : 'pi-sun text-amber-500'"></i>
        </div>
      </button>
    </div>

    <div class="mb-8 bg-white dark:bg-[#111111] p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-3 items-center justify-between shadow-sm">
      <div class="flex gap-3 flex-1 overflow-x-auto px-1">
        <div class="min-w-[220px]">
          <Dropdown 
            v-model="selectedSite" 
            :options="sites" 
            placeholder="Select Site" 
            class="w-full custom-dropdown" 
            :class="{'!text-slate-400': !selectedSite}"
            showClear 
            @change="onSiteChanged" 
          />
        </div>
        <div class="min-w-[220px]">
          <Dropdown 
            v-model="selectedSdwt" 
            :options="sdwts" 
            placeholder="Select SDWT" 
            class="w-full custom-dropdown" 
            :class="{'!text-slate-400': !selectedSdwt}"
            :disabled="!selectedSite" 
            showClear 
            @change="onSdwtChange" 
          />
        </div>
      </div>
      <Button 
        icon="pi pi-sync" 
        rounded text 
        severity="secondary" 
        @click="loadData" 
        :disabled="!hasSearched"
        v-tooltip.left="'Refresh'" 
        class="!w-9 !h-9 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors" 
      />
    </div>

    <div v-if="!hasSearched" class="flex flex-col justify-center items-center h-96 fade-in border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
      <div class="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-zinc-500">
        <i class="pi pi-search text-2xl"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-700 dark:text-slate-200">Ready to Analyze</h3>
      <p class="text-slate-500 dark:text-slate-500 text-sm mt-1">Please select a <b>Site</b> and <b>SDWT</b> to view the dashboard.</p>
    </div>

    <div v-else class="space-y-8 fade-in">
      
      <div v-if="isSummaryLoading" class="flex flex-col justify-center items-center h-28">
        <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
        <p class="text-xs text-slate-400 mt-2">Loading Summary...</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div @click="activeFilter = 'All'" 
             class="group relative h-28 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-indigo-500/20 overflow-hidden"
             :class="activeFilter === 'All' ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-black' : ''"
             style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
          
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p class="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Total Agents</p>
              <p class="text-4xl font-black text-white tracking-tight">{{ summary.totalEqpCount }}</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <i class="pi pi-server text-2xl"></i>
            </div>
          </div>
          <div class="absolute -right-4 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div @click="activeFilter = 'Online'" 
             class="relative h-28 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
             :class="[
               activeFilter === 'Online' 
                 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-black border-transparent' 
                 : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-emerald-400'
             ]">
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest mb-1" 
                 :class="activeFilter === 'Online' ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'">Online</p>
              <p class="text-4xl font-black tracking-tight" 
                 :class="activeFilter === 'Online' ? 'text-white' : 'text-slate-800 dark:text-white'">{{ summary.onlineAgentCount }}</p>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" 
                 :class="activeFilter === 'Online' ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-zinc-800 text-emerald-500'">
              <i class="pi pi-wifi text-2xl"></i>
            </div>
          </div>
        </div>

        <div @click="activeFilter = 'Offline'" 
             class="relative h-28 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
             :class="[
               activeFilter === 'Offline' 
                 ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 ring-2 ring-offset-2 ring-rose-500 dark:ring-offset-black border-transparent' 
                 : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-rose-400'
             ]">
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest mb-1" 
                 :class="activeFilter === 'Offline' ? 'text-rose-100' : 'text-slate-400 dark:text-zinc-500'">Offline</p>
              <p class="text-4xl font-black tracking-tight" 
                 :class="activeFilter === 'Offline' ? 'text-white' : 'text-slate-800 dark:text-white'">{{ summary.totalEqpCount - summary.onlineAgentCount }}</p>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" 
                 :class="activeFilter === 'Offline' ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-zinc-800 text-rose-500'">
              <i class="pi pi-ban text-2xl"></i>
            </div>
          </div>
        </div>

        <div @click="activeFilter = 'Alarm'" 
             class="relative h-28 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
             :class="[
               activeFilter === 'Alarm' 
                 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-black border-transparent' 
                 : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-amber-400'
             ]">
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest mb-1" 
                 :class="activeFilter === 'Alarm' ? 'text-amber-100' : 'text-slate-400 dark:text-zinc-500'">Alerts</p>
              <div class="flex items-baseline gap-2">
                 <p class="text-4xl font-black tracking-tight" 
                    :class="activeFilter === 'Alarm' ? 'text-white' : 'text-slate-800 dark:text-white'">{{ summary.todayErrorCount }}</p>
                 <span v-if="summary.newAlarmCount > 0" class="text-[10px] font-bold px-1.5 py-0.5 rounded" 
                       :class="activeFilter === 'Alarm' ? 'bg-white/30 text-white' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'">+{{ summary.newAlarmCount }}</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" 
                 :class="activeFilter === 'Alarm' ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-zinc-800 text-amber-500'">
              <i class="pi pi-bell text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
           <div class="flex items-center gap-3">
             <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
             <h3 class="font-bold text-base text-slate-800 dark:text-white">Agent Status</h3>
           </div>
        </div>

        <DataTable 
          :value="filteredAgents" 
          :paginator="true" 
          :rows="10" 
          class="p-datatable-lg" 
          :rowHover="true" 
          :loading="isTableLoading"
        >
          <template #empty>
              <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                <i class="pi pi-filter text-3xl mb-3 opacity-20"></i>
                <p class="text-xs font-medium">No match found.</p>
              </div>
          </template>

          <Column field="isOnline" header="STATUS" class="pl-8" headerClass="pl-8" style="width: 140px">
            <template #body="{ data }">
               <div class="flex items-center gap-2.5">
                 <div class="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" :class="data.isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'"></div>
                 <span class="text-[11px] font-bold tracking-wide" :class="data.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'">{{ data.isOnline ? 'ONLINE' : 'OFFLINE' }}</span>
               </div>
            </template>
          </Column>

          <Column field="eqpId" header="EQP ID" sortable>
             <template #body="{ data }"><span class="font-bold text-slate-700 dark:text-slate-200 text-sm">{{ data.eqpId }}</span></template>
          </Column>
          <Column field="type" header="TYPE" class="text-slate-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider"></Column>
          <Column field="pcName" header="HOST" class="text-slate-500 dark:text-zinc-400 text-xs font-medium"></Column>
          
          <Column header="RESOURCES" style="width: 240px">
            <template #body="{ data }">
              <div class="flex flex-col gap-2 cursor-pointer group opacity-80 hover:opacity-100 transition-opacity" @click="openChart(data)">
                 <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                    <span class="w-8">CPU</span>
                    <div class="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 rounded-full transition-all duration-500" :style="{ width: data.cpuUsage + '%' }"></div>
                    </div>
                    <span class="w-8 text-right text-slate-600 dark:text-slate-400">{{ data.cpuUsage.toFixed(0) }}%</span>
                 </div>
                 <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                    <span class="w-8">MEM</span>
                    <div class="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-500 rounded-full" :style="{ width: data.memoryUsage + '%' }"></div>
                    </div>
                    <span class="w-8 text-right text-slate-600 dark:text-slate-400">{{ data.memoryUsage.toFixed(0) }}%</span>
                 </div>
              </div>
            </template>
          </Column>
          
          <Column field="lastContact" header="LAST SEEN" sortable>
             <template #body="{ data }"><span class="text-xs text-slate-400 dark:text-zinc-500 font-mono">{{ formatDate(data.lastContact) }}</span></template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="showChart" modal :header="(selectedAgentId || '') + ' Analytics'" :style="{ width: '80vw' }" class="backdrop-blur-xl">
       <div class="h-[500px] w-full bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800">
         <AmChart v-if="chartData.length > 0" chartType="PerformanceLineChart" :data="chartData" :config="chartConfig" height="100%" :isDarkMode="isDark" />
       </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { dashboardApi, type DashboardSummaryDto, type AgentStatusDto } from '@/api/dashboard';
import AmChart from '@/components/common/AmChart.vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';

const isDark = ref(localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
if (isDark.value) document.documentElement.classList.add('dark');
else document.documentElement.classList.remove('dark');

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  }
};

// [수정] isLoading(전체 로더) 제거하고 개별 로딩 상태 사용
const isSummaryLoading = ref(false);
const isTableLoading = ref(false);
const hasSearched = ref(false);

const activeFilter = ref<'All' | 'Online' | 'Offline' | 'Alarm'>('All');
const selectedSite = ref('');
const selectedSdwt = ref('');
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const summary = ref<DashboardSummaryDto>({ totalEqpCount: 0, onlineAgentCount: 0, todayErrorCount: 0, newAlarmCount: 0 });
const agentList = ref<AgentStatusDto[]>([]);
const showChart = ref(false);
const selectedAgentId = ref<string | null>(null);
const chartData = ref<any[]>([]);
const chartConfig = {
  xField: "timestamp", xTimeUnit: "minute", xAxisDateFormat: "MM-dd HH:mm",
  series: [
    { name: "CPU", valueField: "cpuUsage", color: "#6366f1", tooltipText: "{valueY}%" },
    { name: "Memory", valueField: "memoryUsage", color: "#a855f7", tooltipText: "{valueY}%" }
  ]
};

const filteredAgents = computed(() => {
  switch (activeFilter.value) {
    case 'Online': return agentList.value.filter(a => a.isOnline);
    case 'Offline': return agentList.value.filter(a => !a.isOnline);
    case 'Alarm': return agentList.value.filter(a => a.todayAlarmCount > 0);
    default: return agentList.value;
  }
});

onMounted(async () => {
  try {
    sites.value = await dashboardApi.getSites();
  } catch (e) {
    console.error("Site loading failed", e);
  }
});

const loadData = async () => {
  if (!selectedSite.value || !selectedSdwt.value) return;

  // [수정] 로딩 시작: 카드와 테이블 각각 true
  isSummaryLoading.value = true;
  isTableLoading.value = true;
  hasSearched.value = true;
  
  // [수정] 개별 비동기 호출로 빠른 응답 먼저 처리
  dashboardApi.getSummary(selectedSite.value, selectedSdwt.value)
    .then(data => {
      summary.value = data;
      isSummaryLoading.value = false;
    })
    .catch(e => console.error("Summary failed", e));

  dashboardApi.getAgentStatus(selectedSite.value, selectedSdwt.value)
    .then(data => {
      agentList.value = data;
      isTableLoading.value = false;
    })
    .catch(e => console.error("Agent status failed", e));
};

const onSiteChanged = async () => {
  selectedSdwt.value = '';
  hasSearched.value = false;
  if (selectedSite.value) {
    sdwts.value = await dashboardApi.getSdwts(selectedSite.value);
  } else {
    sdwts.value = [];
  }
};

const onSdwtChange = async () => { 
  if (selectedSite.value && selectedSdwt.value) {
    await loadData(); 
  }
};

const openChart = async (agent: AgentStatusDto) => {
  selectedAgentId.value = agent.eqpId;
  showChart.value = true;
  chartData.value = [];
  setTimeout(() => {
    chartData.value = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100
    }));
  }, 500);
};

const formatDate = (d: string | null) => d ? new Date(d).toLocaleString() : '-';
</script>

<style scoped>
/* Dropdown Panel Styles */
:deep(.p-dropdown-panel) {
  background-color: white !important;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.75rem;
  margin-top: 0.25rem;
}
:deep(.dark .p-dropdown-panel) {
  background-color: #18181b !important;
  border-color: #27272a;
}
:deep(.p-dropdown-items) { padding: 0.375rem !important; }
:deep(.p-dropdown-item) {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem !important;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  transition: all 0.2s;
}
:deep(.dark .p-dropdown-item) { color: #cbd5e1; }
:deep(.p-dropdown-item:not(.p-highlight):not(.p-disabled):hover) { background-color: #f1f5f9 !important; }
:deep(.dark .p-dropdown-item:not(.p-highlight):not(.p-disabled):hover) { background-color: #27272a !important; }
:deep(.p-dropdown-item.p-highlight) { background-color: #eff6ff !important; color: #4f46e5 !important; }
:deep(.dark .p-dropdown-item.p-highlight) { background-color: rgba(79, 70, 229, 0.1) !important; color: #818cf8 !important; }

:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm shadow-none transition-colors;
}
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.custom-dropdown .p-dropdown-label) { padding: 0.6rem 1rem; }
:deep(.custom-dropdown .p-dropdown-trigger) { @apply text-slate-400 dark:text-zinc-500 w-10; }

/* Table Styles */
:deep(.p-datatable .p-datatable-header) { background: transparent; border: none; padding: 0; }
:deep(.p-column-header-content) { color: #94a3b8; font-size: 0.65rem; letter-spacing: 0.08em; font-weight: 800; }
:deep(.dark .p-column-header-content) { color: #52525b; }
:deep(.p-datatable-tbody > tr) { background: transparent !important; border-bottom: 1px solid #f1f5f9; }
:deep(.dark .p-datatable-tbody > tr) { border-bottom: 1px solid #18181b; }
:deep(.p-datatable-tbody > tr:hover) { background-color: #f8fafc !important; }
:deep(.dark .p-datatable-tbody > tr:hover) { background-color: #09090b !important; }
:deep(.p-datatable-tbody > tr > td) { padding: 1rem 1.5rem; }

.fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

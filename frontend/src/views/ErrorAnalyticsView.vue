<!-- frontend/src/views/ErrorAnalyticsView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] relative">
    
    <div v-if="isDefenderMode" class="fixed inset-0 z-[9999] cursor-none bg-slate-900/90 backdrop-blur-sm">
      <canvas 
        ref="defenderCanvas" 
        class="w-full h-full block absolute inset-0"
      ></canvas>
    </div>

    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
        <i class="text-lg text-rose-500 pi pi-bell dark:text-rose-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Error History</h1>
        <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">System error logs & trend analysis.</span>
      </div>
    </div>

    <div class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300">
      <div class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide">
        <div class="min-w-[140px] shrink-0">
          <Select v-model="filter.site" :options="sites" placeholder="Site" class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" showClear @change="onSiteChange" />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select v-model="filter.sdwt" :options="sdwts" placeholder="SDWT" :disabled="!filter.site" class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" showClear @change="onSdwtChange" />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select v-model="filter.eqpId" :options="eqpIds" filter resetFilterOnHide placeholder="EQP ID" :disabled="!filter.sdwt" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onEqpIdChange" />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker v-model="filter.startDate" showIcon dateFormat="yy-mm-dd" placeholder="Start Date" class="w-full custom-dropdown small date-picker" />
        </div>
        <div class="min-w-[150px] shrink-0">
          <DatePicker v-model="filter.endDate" showIcon dateFormat="yy-mm-dd" placeholder="End Date" class="w-full custom-dropdown small date-picker" />
        </div>
      </div>

      <div class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800">
        <Button icon="pi pi-search" rounded class="!bg-rose-500 !border-rose-500 hover:!bg-rose-600 !w-8 !h-8 !text-xs" @click="search" :disabled="!filter.sdwt || !filter.startDate || !filter.endDate || isLoading" />
        <Button icon="pi pi-refresh" text rounded severity="secondary" v-tooltip.left="'Reset'" @click="reset" class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors" />
      </div>
    </div>

    <div v-if="hasSearched" class="flex flex-col flex-1 min-h-0 gap-4 pb-2 overflow-hidden animate-fade-in relative">
      <div v-if="isLoading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-transparent">
        <div class="relative">
          <div class="w-10 h-10 border-4 rounded-full border-slate-100 dark:border-zinc-800"></div>
          <div class="absolute top-0 left-0 w-10 h-10 border-4 rounded-full border-rose-500 border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-3 text-xs font-bold text-slate-500 animate-pulse">Loading Error History...</p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3 shrink-0">
        <div class="relative p-4 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl group">
          <div class="absolute right-0 top-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Total Errors</p>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-3xl font-black text-rose-500">{{ summary.totalErrorCount?.toLocaleString() ?? 0 }}</span>
            <span class="mb-1 text-xs font-medium text-slate-400">events</span>
          </div>
        </div>
        <div class="relative p-4 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl group">
          <div class="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Impacted Units</p>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-3xl font-black text-slate-800 dark:text-white">{{ summary.errorEqpCount?.toLocaleString() ?? 0 }}</span>
            <span class="mb-1 text-xs font-medium text-slate-400">machines</span>
          </div>
        </div>
        <div class="relative p-4 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl group">
          <div class="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Most Frequent Error</p>
          <div class="mt-1">
            <div class="flex items-baseline justify-between">
              <span class="text-lg font-bold text-blue-600 dark:text-blue-400 truncate pr-2" :title="summary.topErrorId">{{ summary.topErrorId || "-" }}</span>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ summary.topErrorCount?.toLocaleString() ?? 0 }} times</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5" :title="summary.topErrorLabel">{{ summary.topErrorLabel || "No Data" }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[224px] shrink-0">
        <div class="flex flex-col overflow-hidden bg-white border shadow-sm lg:col-span-2 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl relative group">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
            <h3 class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><i class="pi pi-chart-bar text-rose-500"></i> Daily Trend</h3>
            <button v-if="gridFilter.date" @click.stop="clearGridDateFilter" class="text-[10px] px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors">Reset Filter</button>
          </div>
          <div class="relative flex-1 w-full min-h-0 cursor-pointer">
            <EChart v-if="trendData.length > 0" :option="trendOption" @chartCreated="onTrendChartInit" />
            <div v-else class="flex items-center justify-center h-full text-xs text-slate-400">No trend data available</div>
          </div>
        </div>

        <div class="flex flex-col overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl relative group">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
            <h3 class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><i class="pi pi-sort-amount-down text-orange-500"></i> Worst Equipment</h3>
            <button v-if="gridFilter.eqpId" @click.stop="clearGridEqpFilter" class="text-[10px] px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">Reset Filter</button>
          </div>
          <div class="relative flex-1 w-full min-h-0 cursor-pointer">
            <EChart v-if="summary.errorCountByEqp && summary.errorCountByEqp.length > 0" :option="byEqpOption" @chartCreated="onEqpChartInit" />
            <div v-else class="flex items-center justify-center h-full text-xs text-slate-400">No equipment data available</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col h-[370px] shrink-0 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl">
        <div class="flex items-center justify-between px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0">
          <div class="flex items-center gap-2">
            <i class="text-slate-400 pi pi-list"></i>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Error Log Details</h3>
            <div class="flex gap-1 ml-2">
              <span v-if="gridFilter.date" class="px-2 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900/30">Date: {{ formatGridFilterDate(gridFilter.date) }}</span>
              <span v-if="gridFilter.eqpId" class="px-2 py-0.5 text-[10px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded border border-purple-100 dark:border-purple-900/30">EQP: {{ gridFilter.eqpId }}</span>
            </div>
          </div>
          
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <button 
              v-if="totalRecords > 0 && !isExportDisabled" 
              @click="exportCSV" 
              :disabled="isExporting" 
              title="CSV Export"
              class="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 mr-1"
            >
              <i v-if="isExporting" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-download"></i>
              {{ isExporting ? 'Exporting...' : 'CSV Export' }}
            </button>

            <div class="flex items-center gap-2">
              <span class="font-medium">Rows:</span>
              <select v-model="rowsPerPage" @change="first = 0; loadGridData();" class="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
            <div class="h-3 mx-1 w-px bg-slate-200 dark:bg-zinc-700"></div>
            <span class="font-medium min-w-[70px] text-right">{{ totalRecords === 0 ? 0 : first + 1 }} - {{ Math.min(first + rowsPerPage, totalRecords) }} / {{ totalRecords }}</span>
            <div class="flex items-center gap-1 ml-1">
              <button @click="first = 0; loadGridData();" :disabled="first === 0" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><i class="pi pi-angle-double-left text-[10px]"></i></button>
              <button @click="prevPage" :disabled="first === 0" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><i class="pi pi-angle-left text-[10px]"></i></button>
              <button @click="nextPage" :disabled="first + rowsPerPage >= totalRecords" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><i class="pi pi-angle-right text-[10px]"></i></button>
              <button @click="lastPage" :disabled="first + rowsPerPage >= totalRecords" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><i class="pi pi-angle-double-right text-[10px]"></i></button>
            </div>
          </div>
        </div>
        <div class="relative w-full flex-1 min-h-0">
          <DataTable :value="logs" :lazy="true" :paginator="false" :rows="rowsPerPage" :loading="isGridLoading" class="absolute inset-0 text-xs p-datatable-sm custom-header-group" stripedRows scrollable scrollHeight="flex" removableSort>
            <template #empty>
              <div class="flex flex-col items-center justify-center h-full text-slate-400">
                <i class="mb-2 text-3xl opacity-30 pi pi-filter-slash"></i>
                <p class="font-medium">No logs found.</p>
              </div>
            </template>
            <Column field="timeStamp" header="Time" style="min-width: 160px">
              <template #body="{ data }">
                <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {{ formatDate(data.timeStamp, false, true) }}
                </span>
              </template>
            </Column>
            <Column field="eqpId" header="EQP ID" style="min-width: 120px">
              <template #body="{ data }">
                <span class="font-bold text-slate-700 dark:text-slate-200">{{ data.eqpId }}</span>
              </template>
            </Column>
            <Column field="errorId" header="Error ID" style="min-width: 100px">
              <template #body="{ data }">
                <span class="font-mono font-bold">{{ data.errorId }}</span>
              </template>
            </Column>
            <Column field="errorLabel" header="Label" style="min-width: 180px"></Column>
            <Column field="errorDesc" header="Description" style="min-width: 250px"></Column>
            <Column field="extraMessage1" header="Extra 1" style="min-width: 150px"></Column>
            <Column field="extraMessage2" header="Extra 2" style="min-width: 150px"></Column>
          </DataTable>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 min-h-[400px] opacity-50 select-none">
      <div class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800">
        <i class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-search"></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Ready to Search</p>
      <p class="mt-1 text-xs text-slate-400">Please select filters to analyze error history.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { getEqpIds } from "@/api/equipment";
import {
  getErrorSummary,
  getErrorTrend,
  getErrorLogs,
  type ErrorSummary,
  type ErrorLogItem,
  type ErrorTrendItem
} from "@/api/error";
import EChart from "@/components/common/EChart.vue";

import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const authStore = useAuthStore();
const LS_KEYS = { SITE: "error-view-site", SDWT: "error-view-sdwt", EQPID: "error-view-eqpid" };

// 🌟 Export 권한 체크 로직
const isExportDisabled = computed(() => {
  const role = authStore.user?.role?.toUpperCase();
  return role === 'VIEWER' || role === 'GUEST';
});

const filter = reactive({ site: "", sdwt: "", eqpId: "", startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), endDate: new Date() });
const gridFilter = reactive({ date: null as string | null, eqpId: null as string | null });

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const isLoading = ref(false);
const isGridLoading = ref(false);
const hasSearched = ref(false);
const isExporting = ref(false);

const summary = ref<ErrorSummary>({ totalErrorCount: 0, errorEqpCount: 0, topErrorId: "", topErrorCount: 0, topErrorLabel: "", errorCountByEqp: [] });
const trendData = ref<ErrorTrendItem[]>([]);
const logs = ref<ErrorLogItem[]>([]);
const totalRecords = ref(0);
const rowsPerPage = ref(10);
const first = ref(0);

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      isDarkMode.value = document.documentElement.classList.contains("dark");
    }
  });
});

const isDefenderMode = ref(false);
const defenderCanvas = ref<HTMLCanvasElement | null>(null);
let defenderReqId: number;
const defenderCode = ['e', 'r', 'r', 'o', 'r'];
let defenderPos = 0;

const handleDefenderKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isDefenderMode.value) {
    stopDefenderGame();
    return;
  }
  const target = e.target as HTMLElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.p-dropdown-filter'))) {
    defenderPos = 0;
    return;
  }
  if (!isDefenderMode.value) {
    const expectedKey = defenderCode[defenderPos];
    if (expectedKey && e.key.toLowerCase() === expectedKey.toLowerCase()) {
      defenderPos++;
      if (defenderPos === defenderCode.length) {
        isDefenderMode.value = true;
        defenderPos = 0;
        nextTick(() => startDefenderGame());
      }
    } else {
      defenderPos = 0;
      const firstKey = defenderCode[0];
      if (firstKey && e.key.toLowerCase() === firstKey.toLowerCase()) {
        defenderPos = 1;
      }
    }
  }
};

const startDefenderGame = () => {
  const canvas = defenderCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let mouseX = canvas.width / 2;
  let mouseY = canvas.height - 50;
  const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
  let lasers: {x: number, y: number}[] = [];
  const onClick = () => { if (!isGameOver) lasers.push({ x: mouseX, y: mouseY - 20 }); };
  const onResize = () => { if (isDefenderMode.value && defenderCanvas.value) { defenderCanvas.value.width = window.innerWidth; defenderCanvas.value.height = window.innerHeight; } };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);
  let enemies: {x: number, y: number, speed: number, text: string, isBonus: boolean}[] = [];
  let explosions: {x: number, y: number, life: number}[] = [];
  let floatingTexts: {x: number, y: number, text: string, life: number, color: string}[] = [];
  let score = 0;
  let timeLeft = 10.0;
  let isGameOver = false;
  let isSaving = false;
  let lastTime = performance.now();
  let leaderboard: any[] = [];
  const icons = ['⚠️', '🔔', '❌', '🔥', '🐛'];
  let lastSpawn = performance.now();
  let spawnRate = 600;
  const draw = (time: number) => {
    if (!isDefenderMode.value) return;
    const delta = time - lastTime;
    lastTime = time;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!isGameOver) {
      timeLeft -= delta / 1000;
      if (timeLeft <= 0) {
        timeLeft = 0; isGameOver = true; isSaving = true;
        dashboardApi.saveEasterEgg({ eggType: 'DEFENDER', score: score }).then(() => dashboardApi.getEasterEggRanking('DEFENDER')).then((res: any[]) => { leaderboard = res; isSaving = false; }).catch(e => { console.error(e); isSaving = false; });
      }
    }
    if (isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#10b981'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 48px sans-serif'; ctx.shadowColor = '#059669'; ctx.shadowBlur = 20;
      ctx.fillText('🎉 오늘의 장애 대응 완료! 🎉', canvas.width / 2, canvas.height / 2 - 20);
      ctx.shadowBlur = 0; ctx.fillStyle = '#cbd5e1'; ctx.font = '600 20px sans-serif'; ctx.fillText(`최종 방어 건수: ${score}건`, canvas.width / 2, canvas.height / 2 + 30); ctx.fillText('ESC 키를 눌러 업무로 복귀하기', canvas.width / 2, canvas.height / 2 + 70);
      ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.shadowBlur = 0; ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('🏆 Global Top Defenders', canvas.width - 40, 40);
      if (isSaving) { ctx.font = 'bold 18px monospace'; ctx.fillStyle = '#cbd5e1'; ctx.fillText('서버에 기록 저장 중...', canvas.width - 40, 80); } else {
        const currentUser = authStore.user?.username || authStore.user?.userId || '';
        if (leaderboard.length === 0) { ctx.font = 'bold 18px monospace'; ctx.fillStyle = '#cbd5e1'; ctx.fillText('아직 등록된 기록이 없습니다.', canvas.width - 40, 80); } else {
           leaderboard.forEach((entry: any, idx: number) => { const y = 80 + (idx * 30); const isMe = entry.id === currentUser; ctx.font = 'bold 18px monospace'; ctx.fillStyle = isMe ? '#10b981' : '#cbd5e1'; ctx.fillText(`${idx + 1}. ${entry.id.padEnd(12, ' ')} ${String(entry.score).padStart(3, ' ')}건`, canvas.width - 40, y); });
        }
      }
      defenderReqId = requestAnimationFrame(draw); return;
    }
    if (time - lastSpawn > spawnRate) {
      const isBonus = Math.random() < 0.12; const randomIcon = isBonus ? '⏱️' : (icons[Math.floor(Math.random() * icons.length)] || '⚠️');
      enemies.push({ x: Math.random() * (canvas.width - 60) + 30, y: -30, speed: Math.random() * 3 + 2 + (score * 0.1), text: randomIcon, isBonus: isBonus });
      lastSpawn = time; spawnRate = Math.max(200, 700 - score * 10);
    }
    ctx.fillStyle = '#06b6d4'; ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 10;
    for (let i = lasers.length - 1; i >= 0; i--) { const laser = lasers[i]; if (!laser) continue; laser.y -= 15; ctx.fillRect(laser.x - 2, laser.y, 4, 20); if (laser.y < -20) lasers.splice(i, 1); }
    ctx.shadowBlur = 0; ctx.font = '28px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i]; if (!enemy) continue; enemy.y += enemy.speed; ctx.fillText(enemy.text, enemy.x, enemy.y);
      let hit = false;
      for (let j = lasers.length - 1; j >= 0; j--) {
        const laser = lasers[j]; if (!laser) continue; const dx = enemy.x - laser.x; const dy = enemy.y - laser.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) { hit = true; lasers.splice(j, 1); if (enemy.isBonus) { timeLeft += 1.0; floatingTexts.push({ x: enemy.x, y: enemy.y, text: '+1 Sec', life: 40, color: '#10b981' }); } else { score++; floatingTexts.push({ x: enemy.x, y: enemy.y, text: '+1', life: 20, color: '#06b6d4' }); } break; }
      }
      if (hit) { explosions.push({ x: enemy.x, y: enemy.y, life: 15 }); enemies.splice(i, 1); continue; }
      if (enemy.y > canvas.height + 30) { enemies.splice(i, 1); score = Math.max(0, score - 1); }
    }
    for (let i = explosions.length - 1; i >= 0; i--) { const exp = explosions[i]; if (!exp) continue; ctx.font = `${20 + (15 - exp.life) * 2.5}px Arial`; ctx.globalAlpha = exp.life / 15; ctx.fillText('💥', exp.x, exp.y); ctx.globalAlpha = 1.0; exp.life--; if (exp.life <= 0) explosions.splice(i, 1); }
    for (let i = floatingTexts.length - 1; i >= 0; i--) { const ft = floatingTexts[i]; if (!ft) continue; ctx.globalAlpha = Math.max(0, ft.life / 40); ctx.fillStyle = ft.color; ctx.font = 'bold 20px Arial'; ctx.fillText(ft.text, ft.x, ft.y); ctx.globalAlpha = 1.0; ft.y -= 1.5; ft.life--; if (ft.life <= 0) floatingTexts.splice(i, 1); }
    ctx.save(); ctx.translate(mouseX, mouseY); ctx.rotate(-45 * Math.PI / 180); ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🚀', 0, 0); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`Score: ${score}`, 30, 50);
    ctx.textAlign = 'center'; ctx.font = 'bold 36px sans-serif'; ctx.fillStyle = timeLeft <= 3 ? '#f43f5e' : '#10b981'; ctx.fillText(`⏱️ ${Math.ceil(timeLeft)}s`, canvas.width / 2, 50);
    defenderReqId = requestAnimationFrame(draw);
  };
  defenderReqId = requestAnimationFrame(draw);
  (canvas as any).cleanup = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('click', onClick); window.removeEventListener('resize', onResize); };
};
const stopDefenderGame = () => { isDefenderMode.value = false; if (defenderReqId) cancelAnimationFrame(defenderReqId); if (defenderCanvas.value && (defenderCanvas.value as any).cleanup) { (defenderCanvas.value as any).cleanup(); } };

const formatGridFilterDate = (rawDate: any) => {
  const dStr = String(rawDate || ""); const match4 = dStr.match(/(\d{4})-(\d{2})-(\d{2})/); const m4_1 = match4?.[1], m4_2 = match4?.[2], m4_3 = match4?.[3]; if (m4_1 && m4_2 && m4_3) return `${m4_1.slice(2)}-${m4_2}-${m4_3}`;
  const match2 = dStr.match(/(\d{2})-(\d{2})-(\d{2})/); const m2_1 = match2?.[1], m2_2 = match2?.[2], m2_3 = match2?.[3]; if (m2_1 && m2_2 && m2_3) return `${m2_1}-${m2_2}-${m2_3}`;
  return dStr;
};

watch([() => filter.startDate, () => filter.endDate], ([newStart, newEnd], [oldStart, oldEnd]) => {
  if (newStart && newEnd) {
    const startMs = newStart.getTime(); const endMs = newEnd.getTime();
    if (startMs > endMs) { if (startMs !== oldStart?.getTime()) filter.endDate = new Date(newStart); else if (endMs !== oldEnd?.getTime()) filter.startDate = new Date(newEnd); }
  }
});

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  let targetSite = ""; let targetSdwt = "";
  if (authStore.user?.site) { targetSite = authStore.user.site; targetSdwt = authStore.user.sdwt || ""; } else { targetSite = localStorage.getItem(LS_KEYS.SITE) || ""; targetSdwt = localStorage.getItem(LS_KEYS.SDWT) || ""; }
  if (targetSite && sites.value.includes(targetSite)) {
    filter.site = targetSite;
    try {
      sdwts.value = await dashboardApi.getSdwts(targetSite);
      if (targetSdwt && sdwts.value.includes(targetSdwt)) {
        filter.sdwt = targetSdwt; eqpIds.value = await getEqpIds({ sdwt: targetSdwt, type: "error" });
        const initEqpId = localStorage.getItem(LS_KEYS.EQPID) || ""; if (initEqpId && eqpIds.value.includes(initEqpId)) filter.eqpId = initEqpId;
        if (filter.sdwt) search();
      }
    } catch (e) { console.error("Failed to restore filter state:", e); }
  }
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener('keydown', handleDefenderKeydown);
});

onUnmounted(() => {
  themeObserver.disconnect(); window.removeEventListener('keydown', handleDefenderKeydown); stopDefenderGame();
});

watch(() => filter.site, (n) => n ? localStorage.setItem(LS_KEYS.SITE, n) : localStorage.removeItem(LS_KEYS.SITE));
watch(() => filter.sdwt, (n) => n ? localStorage.setItem(LS_KEYS.SDWT, n) : localStorage.removeItem(LS_KEYS.SDWT));
watch(() => filter.eqpId, (n) => n ? localStorage.setItem(LS_KEYS.EQPID, n) : localStorage.removeItem(LS_KEYS.EQPID));

// 🌟 여기서 unused 변수(yy2)를 완전히 제거하고 포맷팅 로직을 분리/개선했습니다.
const toDateTimeString = (rawDate: any, isEndDate: boolean = false) => {
  if (!rawDate) return "";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return "";
  
  if (isEndDate) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  
  return `${yy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
};

const resetView = () => { hasSearched.value = false; summary.value = { totalErrorCount: 0, errorEqpCount: 0, topErrorId: "", topErrorCount: 0, topErrorLabel: "", errorCountByEqp: [] }; trendData.value = []; logs.value = []; };
const onSiteChange = async () => { if (filter.site) sdwts.value = await dashboardApi.getSdwts(filter.site); else sdwts.value = []; filter.sdwt = ""; filter.eqpId = ""; eqpIds.value = []; resetView(); };
const onSdwtChange = async () => { filter.eqpId = ""; if (filter.sdwt) { eqpIds.value = await getEqpIds({ sdwt: filter.sdwt, type: "error" }); search(); } else { eqpIds.value = []; resetView(); } };
const onEqpIdChange = () => {};

const getEffectiveParams = (target: 'trend' | 'summary' | 'list' | 'export' = 'list') => {
  let startStr = toDateTimeString(filter.startDate); let endStr = toDateTimeString(filter.endDate, true); let eqps = filter.eqpId;
  if (target !== 'trend' && gridFilter.date) { const dStr = String(gridFilter.date).trim(); const m = dStr.match(/(\d{2,4})-(\d{2})-(\d{2})/); if (m && m[1] && m[2] && m[3]) { const year = m[1].length === 2 ? `20${m[1]}` : m[1]; startStr = `${year}-${m[2]}-${m[3]}T00:00:00`; endStr = `${year}-${m[2]}-${m[3]}T23:59:59`; } }
  if (target !== 'summary' && gridFilter.eqpId) eqps = gridFilter.eqpId;
  return { site: filter.site, sdwt: filter.sdwt, eqpId: eqps, startDate: startStr, endDate: endStr, start: startStr, end: endStr };
};

const search = async () => {
  if (!filter.startDate || !filter.endDate) return; gridFilter.date = null; gridFilter.eqpId = null; hasSearched.value = true; isLoading.value = true; first.value = 0; logs.value = []; summary.value = { totalErrorCount: 0, errorEqpCount: 0, topErrorId: "", topErrorCount: 0, topErrorLabel: "", errorCountByEqp: [] }; trendData.value = [];
  try { await Promise.all([updateSummaryData(), updateTrendData()]); await loadGridData(); } catch (e) { console.error(e); } finally { isLoading.value = false; }
};
  
const updateSummaryData = async () => {
  try { const res = await getErrorSummary(getEffectiveParams('summary')); const resData = (res as any)?.data || res; if (resData) summary.value = resData; else summary.value = { totalErrorCount: 0, errorEqpCount: 0, topErrorId: "", topErrorCount: 0, topErrorLabel: "", errorCountByEqp: [] }; } catch { summary.value = { totalErrorCount: 0, errorEqpCount: 0, topErrorId: "", topErrorCount: 0, topErrorLabel: "", errorCountByEqp: [] }; }
};
const updateTrendData = async () => {
  try { const res = await getErrorTrend(getEffectiveParams('trend')); const resData = (res as any)?.data || res; if (resData && Array.isArray(resData)) trendData.value = resData; else trendData.value = []; } catch { trendData.value = []; }
};
const loadGridData = async () => {
  isGridLoading.value = true;
  try {
    const params = { ...getEffectiveParams('list'), page: Math.floor(first.value / rowsPerPage.value), pageSize: rowsPerPage.value, limit: rowsPerPage.value };
    const res = await getErrorLogs(params); const responseData = res as any; const data = (responseData && responseData.data) ? responseData.data : responseData;
    if (data && Array.isArray(data.items)) { logs.value = data.items; totalRecords.value = data.totalItems || 0; } else { logs.value = []; totalRecords.value = 0; }
  } catch (e) { logs.value = []; totalRecords.value = 0; } finally { isGridLoading.value = false; }
};

const exportCSV = async () => {
  if (isExportDisabled.value) return; // 🌟 함수 방어
  if (totalRecords.value === 0) return;
  isExporting.value = true;
  try {
    const params = { ...getEffectiveParams('export'), page: 0, pageSize: totalRecords.value, limit: totalRecords.value };
    const res = await getErrorLogs(params); const responseData = res as any; const data = (responseData && responseData.data) ? responseData.data : responseData;
    const exportItems = (data && Array.isArray(data.items)) ? data.items : []; if (exportItems.length === 0) return;
    const headers = ['Time', 'EQP ID', 'Error ID', 'Label', 'Description', 'Extra 1', 'Extra 2'];
    const rows = exportItems.map((d: any) => [`="${formatDate(d?.timeStamp, false, true)}"`, `"${d?.eqpId || ''}"`, `"${d?.errorId || ''}"`, `"${(d?.errorLabel || '').replace(/"/g, '""')}"`, `"${(d?.errorDesc || '').replace(/"/g, '""')}"`, `"${(d?.extraMessage1 || '').replace(/"/g, '""')}"`, `"${(d?.extraMessage2 || '').replace(/"/g, '""')}"`]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a');
    const d = new Date(); const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const fileName = `ErrorHistory_${filter.sdwt || 'All'}_${dateStr}.csv`;
    link.setAttribute('href', url); link.setAttribute('download', fileName); document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  } catch (e) { console.error("Export failed", e); } finally { isExporting.value = false; }
};

let isTrendClicking = false; let isEqpClicking = false;
const handleTrendClick = async (p: any) => {
  if (isTrendClicking) return; isTrendClicking = true;
  try {
    const idx = p?.dataIndex; const item = typeof idx === 'number' ? trendData.value[idx] : null; const targetDate = item?.date || p?.name; if (!targetDate || typeof targetDate !== 'string') return;
    if (gridFilter.date === targetDate) gridFilter.date = null; else gridFilter.date = targetDate;
    first.value = 0; await updateSummaryData(); await loadGridData();
  } finally { setTimeout(() => { isTrendClicking = false; }, 200); }
};
const onTrendChartInit = (inst: any) => { if (inst && typeof inst.on === "function") { inst.off("click"); inst.on("click", handleTrendClick); } };

const handleEqpClick = async (p: any) => { 
  if (isEqpClicking) return; isEqpClicking = true;
  try {
    const targetEqp = p?.name; if (!targetEqp || typeof targetEqp !== 'string') return;
    if (gridFilter.eqpId === targetEqp) gridFilter.eqpId = null; else gridFilter.eqpId = targetEqp; 
    first.value = 0; await updateTrendData(); await loadGridData(); 
  } finally { setTimeout(() => { isEqpClicking = false; }, 200); }
};
const onEqpChartInit = (inst: any) => { if (inst && typeof inst.on === "function") { inst.off("click"); inst.on("click", handleEqpClick); } };

const clearGridDateFilter = async () => { gridFilter.date = null; first.value = 0; await updateSummaryData(); await loadGridData(); };
const clearGridEqpFilter = async () => { gridFilter.eqpId = null; first.value = 0; await updateTrendData(); await loadGridData(); };
const prevPage = () => { if (first.value > 0) { first.value -= rowsPerPage.value; loadGridData(); } };
const nextPage = () => { if (first.value + rowsPerPage.value < totalRecords.value) { first.value += rowsPerPage.value; loadGridData(); } };
const lastPage = () => { first.value = Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) * rowsPerPage.value; loadGridData(); };
const reset = () => { resetView(); filter.site = ""; filter.sdwt = ""; filter.eqpId = ""; filter.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); filter.endDate = new Date(); gridFilter.date = null; gridFilter.eqpId = null; sdwts.value = []; eqpIds.value = []; };

const trendOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569"; const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  return {
    backgroundColor: "transparent", tooltip: { trigger: "axis", backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)", borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0", textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" } }, grid: { left: 40, right: 20, top: 30, bottom: 20, containLabel: true },
    xAxis: { type: "category", data: trendData.value.map((d) => { const ds = String(d?.date || ""); const m = ds.match(/(\d{2,4})-(\d{2})-(\d{2})/); if (m && m[1] && m[2] && m[3]) { const yy = m[1].length === 4 ? m[1].slice(2) : m[1]; return `${yy}-${m[2]}-${m[3]}`; } const fallback = ds.split('T')[0] ?? ""; return (fallback.split(' ')[0] ?? "").substring(0, 10); }), axisLabel: { color: textColor, fontSize: 10 }, axisLine: { lineStyle: { color: gridColor } } },
    yAxis: { type: "value", axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } }, series: [{ name: "Errors", type: "bar", data: trendData.value.map((d) => d?.count || 0), itemStyle: { color: "#f43f5e", borderRadius: [4, 4, 0, 0] }, barMaxWidth: 50, cursor: "pointer", label: { show: true, position: "top", color: textColor, fontSize: 10, formatter: "{c} 건" } }]
  };
});
const byEqpOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569"; const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"; const data = (summary.value?.errorCountByEqp || []).slice(0, 10); const colors = ["#f97316", "#ef4444", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"];
  return {
    backgroundColor: "transparent", tooltip: { trigger: "item", backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)", textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" } }, grid: { left: 40, right: 20, top: 30, bottom: 30, containLabel: true },
    xAxis: { type: "category", data: data.map((d) => d?.label || "-"), axisLabel: { color: textColor, fontSize: 10, interval: 0, rotate: 30 }, axisLine: { lineStyle: { color: gridColor } } }, yAxis: { type: "value", axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
    series: [{ name: "Count", type: "bar", data: data.map((d, index) => ({ value: d?.value || 0, itemStyle: { color: colors[index % colors.length] ?? "#f97316", borderRadius: [4, 4, 0, 0] } })), barMaxWidth: 30, cursor: "pointer", label: { show: true, position: "top", color: textColor, fontSize: 10, formatter: "{c} 건" } }]
  };
});
const formatDate = (rawDate: any, short = false, twoDigitYear = false) => {
  if (!rawDate) return "-";
  const dateStr = String(rawDate);
  if (dateStr === 'null' || dateStr === 'undefined') return "-";
  
  const isFormatted = /^\d{2,4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr);
  if (isFormatted) {
    if (short) return dateStr.substring(5, 10);
    if (twoDigitYear) return dateStr.substring(Math.max(0, dateStr.indexOf("-") - 2));
    return dateStr;
  }
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  
  const yy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  
  if (short) return `${mm}-${dd}`;
  if (twoDigitYear) return `${yy.slice(2)}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};
</script>

<style scoped>
:deep(.p-datatable-thead > tr > th) { @apply font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-700 z-10 sticky top-0; }
:deep(.p-datatable-tbody > tr > td) { @apply py-2 px-3 text-[12px] text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800/50; }
:deep(.dark .p-datatable-tbody > tr:hover) { @apply !bg-[#27272a] !text-white; }
:deep(.p-select), :deep(.custom-dropdown) { @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors; }
:deep(.custom-dropdown .p-select-label) { @apply text-[13px] py-[5px] px-3; }
:deep(.custom-input-text.small) { @apply !text-[13px] !p-1 !h-7 !bg-transparent !border-0; }
:deep(.date-picker .p-inputtext) { @apply !text-[13px] !py-1 !px-2 !h-7; }
:deep(.custom-dropdown.small) { @apply h-7; }
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.p-select-dropdown), :deep(.p-autocomplete-dropdown) { @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none; }
:deep(.p-select-dropdown svg) { @apply w-3 h-3; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

<!-- frontend/src/views/GlobalDashboardView.vue -->
<template>
  <div
    class="absolute inset-0 transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col overflow-hidden"
    :class="{ 'money-theme': isMoneyMode }"
  >
    <canvas
      v-if="isMoneyMode"
      ref="moneyCanvas"
      class="fixed inset-0 z-0 w-full h-full pointer-events-none"
    ></canvas>

    <div class="relative z-10 flex flex-col flex-1 pt-2 overflow-hidden">
      <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
        <div class="flex items-center gap-2">
          <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
            <i class="text-lg text-indigo-500 pi pi-globe"></i>
          </div>
          <div class="flex items-baseline gap-2">
            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {{ isMoneyMode ? 'Global Wealth Dashboard' : 'Global Fleet Dashboard' }}
            </h1>
            <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
              {{ isMoneyMode ? 'Infinite Resources Activated' : 'Integrated Version Stability Analysis' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
            <div class="flex items-center gap-1.5">
              <span class="relative flex w-1.5 h-1.5">
                <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
                <span class="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500"></span>
              </span>
              <span class="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">Live</span>
            </div>
            <div class="w-px h-3 bg-slate-200 dark:bg-zinc-700"></div>
            <span class="text-[10px] font-mono font-bold w-[22px] text-center" :class="isRefreshing ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-500 dark:text-zinc-400'">
              {{ isRefreshing ? "..." : countdown + "s" }}
            </span>
          </div>

          <button @click="handleManualRefresh" :disabled="isRefreshing" class="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-all disabled:opacity-50">
            <i class="pi pi-sync" :class="{ 'animate-spin': isRefreshing }"></i>
            <span class="hidden md:inline">Refresh Now</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 px-1 mb-5 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <div class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-indigo-200/40 dark:bg-indigo-500/15 blur-2xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Total Agents</p>
              <p class="mt-0.5 text-2xl font-extrabold text-slate-800 dark:text-white">
                {{ isMoneyMode ? '99,999,999' : globalStats.total }}
                <span class="text-sm font-bold text-slate-400 dark:text-slate-500">{{ isMoneyMode ? '$$$' : 'EA' }}</span>
              </p>
            </div>
            <div class="flex items-center justify-center w-10 h-10 text-indigo-500 border border-indigo-100 rounded-xl bg-indigo-50 dark:bg-zinc-800/80 dark:text-indigo-400 dark:border-zinc-700">
              <i class="text-base pi pi-server"></i>
            </div>
          </div>
        </div>

        <div class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-emerald-200/40 dark:bg-emerald-500/15 blur-2xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Online</p>
              <p class="mt-0.5 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {{ isMoneyMode ? '99,999,999' : globalStats.online }}
                <span class="text-sm font-bold text-emerald-500/70 dark:text-emerald-500/70">{{ isMoneyMode ? '$$$' : 'EA' }}</span>
              </p>
            </div>
            <div class="flex items-center justify-center w-10 h-10 border rounded-xl bg-emerald-50 dark:bg-zinc-800/80 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-zinc-700">
              <i class="text-base pi pi-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-slate-200/40 dark:bg-slate-500/15 blur-2xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Offline</p>
              <p class="mt-0.5 text-2xl font-extrabold text-slate-600 dark:text-slate-400">
                {{ isMoneyMode ? '0' : globalStats.offline }}
                <span class="text-sm font-bold text-slate-500/70 dark:text-slate-500/70">EA</span>
              </p>
            </div>
            <div class="flex items-center justify-center w-10 h-10 border rounded-xl bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-zinc-700">
              <i class="text-base pi pi-times-circle"></i>
            </div>
          </div>
        </div>

        <div class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-amber-200/40 dark:bg-amber-500/15 blur-2xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">{{ isMoneyMode ? 'Net Revenue' : 'Today Errors' }}</p>
              <p class="mt-0.5 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {{ isMoneyMode ? '999.9' : globalStats.alerts }}
                <span class="text-sm font-bold text-amber-500/70 dark:text-amber-500/70">{{ isMoneyMode ? 'Million' : 'Events' }}</span>
              </p>
            </div>
            <div class="flex items-center justify-center w-10 h-10 border rounded-xl bg-amber-50 dark:bg-zinc-800/80 text-amber-500 dark:text-amber-400 border-amber-100 dark:border-zinc-700">
              <i class="text-base" :class="isMoneyMode ? 'pi pi-dollar' : 'pi pi-bell'"></i>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isInitialLoading" class="flex flex-col items-center justify-center w-full py-20">
        <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <i class="text-2xl text-indigo-500 pi pi-spin pi-spinner"></i>
        </div>
        <p class="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">데이터를 불러오는 중입니다...</p>
      </div>

      <div v-else class="flex-1 px-1 pb-2 overflow-hidden">
        <div v-if="globalData.length === 0" class="flex flex-col items-center justify-center min-h-[320px] rounded-3xl border border-dashed border-slate-300 dark:border-zinc-700 bg-white/50 dark:bg-black/20">
          <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800">
            <i class="text-xl pi pi-inbox text-slate-400 dark:text-slate-500"></i>
          </div>
          <p class="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">표시할 데이터가 없습니다.</p>
        </div>

        <div v-else class="flex flex-wrap items-start gap-4">
          <div v-for="site in globalData" :key="site.siteName" class="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] shadow-sm flex flex-col w-full sm:w-fit min-w-[100%] sm:min-w-[230px] max-w-full">
            <div class="absolute right-[-32px] top-[-24px] w-28 h-28 rounded-full blur-3xl opacity-60 pointer-events-none" :class="getSiteGlowClass(site)"></div>
            <div class="relative">
              <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-black/20">
                <div class="flex items-center min-w-0 gap-2">
                  <span class="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" :class="getSiteHealthDot(site)"></span>
                  <div class="min-w-0 pr-4">
                    <h2 class="text-sm font-extrabold tracking-tight truncate text-slate-800 dark:text-white">{{ site.siteName }}</h2>
                  </div>
                </div>
                <div class="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border flex items-baseline gap-0.5" :class="getSiteBadgeClass(site)">
                  <span>{{ site.siteStats.online }} / {{ site.siteStats.total }}</span>
                  <span class="text-[9px] font-medium opacity-80">EA</span>
                </div>
              </div>

              <div class="px-4 pb-3 pt-2.5">
                <div v-if="site.sdwts.length === 0" class="px-4 py-5 text-center border border-dashed rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/30">
                  <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">설정된 SDWT가 없습니다.</span>
                </div>

                <div v-else class="flex flex-wrap justify-center gap-2.5">
                  <button v-for="sdwt in site.sdwts" :key="sdwt.name" type="button" class="w-full sm:w-[190px] xl:w-[200px] shrink-0 group relative overflow-hidden text-left rounded-2xl border px-3 py-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" :class="getSdwtCardClass(sdwt)" @click="goToDetail(site.siteName, sdwt.name)">
                    <div class="absolute left-[-22px] bottom-[-28px] w-24 h-24 rounded-full blur-2xl opacity-70 pointer-events-none" :class="getSdwtGlowClass(sdwt)"></div>
                    <div class="relative">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5">
                            <div v-if="getStabilityScore(sdwt) === 100 || isMoneyMode" class="relative flex items-center justify-center w-[14px] h-[14px] rounded-full animate-halo shrink-0">
                              <i class="absolute pi pi-verified text-blue-500 dark:text-blue-400 text-[14px]" title="전체 장비 최신화 완료"></i>
                            </div>
                            <p class="text-[13px] font-extrabold tracking-tight text-slate-800 dark:text-white truncate">{{ sdwt.name }}</p>
                          </div>
                          <p class="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">{{ getSdwtStatusText(sdwt) }}</p>
                        </div>
                        <div class="flex flex-col items-end gap-1 shrink-0">
                          <span class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold" :class="getSdwtMiniBadgeClass(sdwt)">
                            <span class="w-1.5 h-1.5 rounded-full" :class="getSdwtMiniBadgeDotClass(sdwt)"></span>
                            {{ isMoneyMode ? '100' : getPercent(sdwt.onlineCount, sdwt.totalCount) }}%
                          </span>
                        </div>
                      </div>

                      <div class="flex items-end justify-between mt-2">
                        <div>
                          <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Agent Status</p>
                          <div class="mt-0.5 flex items-baseline gap-1">
                            <span class="text-base font-extrabold text-slate-800 dark:text-white">{{ isMoneyMode ? '999M' : sdwt.onlineCount }}</span>
                            <span class="text-xs font-bold text-slate-300 dark:text-zinc-600">/</span>
                            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ isMoneyMode ? '999M' : sdwt.totalCount }}</span>
                          </div>
                        </div>

                        <div class="flex gap-1 shrink-0">
                          <span v-if="(sdwt.offlineCount > 0) && !isMoneyMode" class="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400 border border-slate-200/80 dark:border-zinc-700/50">
                            OFF {{ sdwt.offlineCount }}
                          </span>
                          <span v-if="(sdwt.summary.todayErrorCount > 0) && !isMoneyMode" class="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-400/10">
                            ERR {{ sdwt.summary.todayErrorCount }}
                          </span>
                        </div>
                      </div>

                      <div class="mt-2" :title="`버전 최신화 지수: ${getStabilityScore(sdwt)}점 (장비수: ${sdwt.totalCount}대)`">
                        <div class="flex justify-between items-baseline mb-1">
                          <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Version Health Index</span>
                          <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            <span class="text-base font-extrabold text-slate-700 dark:text-slate-200">{{ getStabilityScore(sdwt) }}</span> pts
                          </span>
                        </div>
                        <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                          <div class="h-full transition-all duration-700 rounded-full" 
                               :class="getStabilityBarClass(sdwt)" 
                               :style="{ width: `${getStabilityScore(sdwt)}%` }"></div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi, type DashboardSummaryDto } from "@/api/dashboard";

const router = useRouter();
const filterStore = useFilterStore();

interface SdwtData {
  name: string;
  totalCount: number;
  onlineCount: number;
  offlineCount: number;
  latestCount?: number;
  stabilityScore?: number; 
  summary: DashboardSummaryDto;
  isAllLatest?: boolean;
  index: number;
}

interface SiteData {
  siteName: string;
  sdwts: SdwtData[];
  siteStats: { total: number; online: number; offline: number; alerts: number; };
  index: number;
}

const isInitialLoading = ref(true);
const isRefreshing = ref(false);
const globalData = ref<SiteData[]>([]);
const globalStats = ref({ total: 0, online: 0, offline: 0, alerts: 0 });
const countdown = ref(30);
let timerInterval: number | undefined;

// ============================================================================
// Show Me The Money 이스터에그 (money Code)
// ============================================================================
const isMoneyMode = ref(false);
const moneyCanvas = ref<HTMLCanvasElement | null>(null);
let moneyReqId: number;
let coins: any[] = [];

const startMoneyRain = () => {
  const canvas = moneyCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  coins = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    radius: Math.random() * 10 + 10,
    speed: Math.random() * 3 + 2,
    angle: Math.random() * Math.PI * 2,
    spinSpeed: Math.random() * 0.1 + 0.05
  }));

  const draw = () => {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    coins.forEach(c => {
      c.y += c.speed;
      c.angle += c.spinSpeed;
      
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.radius * Math.abs(Math.cos(c.angle)), c.radius, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24'; 
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d97706'; 
      ctx.stroke();

      if (c.y > canvas.height + 30) {
        c.y = -30;
        c.x = Math.random() * canvas.width;
      }
    });
    
    moneyReqId = requestAnimationFrame(draw);
  };
  draw();
};

const stopMoneyRain = () => { if (moneyReqId) cancelAnimationFrame(moneyReqId); };

// ============================================================================
// 통합 키보드 감지 로직
// ============================================================================
const moneyCode = ["m", "o", "n", "e", "y"];
let moneyPos = 0;

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    if (isMoneyMode.value) { isMoneyMode.value = false; stopMoneyRain(); }
    moneyPos = 0;
    return;
  }

  const target = e.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.p-dropdown-filter'))) {
    moneyPos = 0; return;
  }

  const keyLower = e.key.toLowerCase();
  const moneyExpected = moneyCode[moneyPos];
  if (moneyExpected && keyLower === moneyExpected) {
    moneyPos++;
    if (moneyPos === moneyCode.length) {
      isMoneyMode.value = !isMoneyMode.value;
      moneyPos = 0;
      if (isMoneyMode.value) {
        nextTick(() => startMoneyRain());
        dashboardApi.saveEasterEgg({ eggType: "MONEY", score: 99999999 }).catch(err => console.error(err));
      } else stopMoneyRain();
    }
  } else {
    const firstMoney = moneyCode[0];
    moneyPos = (firstMoney && keyLower === firstMoney) ? 1 : 0;
  }
};

const startTimer = () => {
  timerInterval = window.setInterval(() => {
    if (!isRefreshing.value) {
      countdown.value--;
      if (countdown.value <= 0) { countdown.value = 30; fetchAllData(); }
    }
  }, 1000);
};

onMounted(() => {
  fetchAllData();
  startTimer();
  window.addEventListener("keydown", handleKeydown);

  window.addEventListener("resize", () => {
    if (isMoneyMode.value && moneyCanvas.value) {
      moneyCanvas.value.width = window.innerWidth;
      moneyCanvas.value.height = window.innerHeight;
    }
  });
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  window.removeEventListener("keydown", handleKeydown);
  stopMoneyRain();
});

const handleManualRefresh = () => { countdown.value = 30; fetchAllData(); };

const fetchAllData = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  if (globalData.value.length === 0) isInitialLoading.value = true;

  try {
    const finalData = await dashboardApi.getGlobalFleetData();
    if (!finalData || !Array.isArray(finalData)) { globalData.value = []; return; }

    globalData.value = finalData.sort((a: SiteData, b: SiteData) => a.index - b.index);

    let totalAgt = 0, totalOn = 0, totalOff = 0, totalAlerts = 0;
    finalData.forEach((site: SiteData) => {
      totalAgt += site.siteStats.total; totalOn += site.siteStats.online;
      totalOff += site.siteStats.offline; totalAlerts += site.siteStats.alerts;
    });

    globalStats.value = { total: totalAgt, online: totalOn, offline: totalOff, alerts: totalAlerts };
  } catch (error) {
    globalData.value = [];
  } finally {
    isInitialLoading.value = false; isRefreshing.value = false;
  }
};

const goToDetail = (siteName: string, sdwtName: string) => {
  filterStore.selectedSite = siteName; filterStore.selectedSdwt = sdwtName;
  localStorage.setItem("dashboard_site", siteName); localStorage.setItem("dashboard_sdwt", sdwtName);
  router.push({ name: "home" });
};

const getPercent = (part: number, total: number) => total === 0 ? 0 : Math.round((part / total) * 100);

const getStabilityScore = (sdwt: SdwtData): number => {
  if (isMoneyMode.value) return 100;
  if (sdwt.totalCount === 0) return 0;
  if (sdwt.stabilityScore !== undefined) {
    return Math.max(0, Math.min(100, Math.round(sdwt.stabilityScore)));
  }
  return getPercent(sdwt.latestCount || 0, sdwt.totalCount);
};

// ============================================================================
// [기능 수정] 장비의 실제 가동 상태를 기반으로 한 텍스트 출력 로직
// ============================================================================
const getSdwtStatusText = (sdwt: SdwtData) => {
  if (isMoneyMode.value) return 'Rich & Stable';
  if (sdwt.totalCount === 0) return 'No registered agent';
  if (sdwt.onlineCount === 0) return 'All Offline';
  
  const hasOffline = sdwt.offlineCount > 0;
  const hasError = sdwt.summary.todayErrorCount > 0;

  if (hasOffline && hasError) return 'Partial Offline / Error';
  if (hasOffline) return 'Partial Offline';
  if (hasError) return 'Partial Error';
  
  return 'Stable';
};

const getStabilityBarClass = (sdwt: SdwtData) => {
  if (isMoneyMode.value) return "bg-gradient-to-r from-amber-500 to-yellow-400";
  if (sdwt.totalCount === 0) return "bg-gradient-to-r from-slate-400 to-slate-300 dark:from-zinc-600 dark:to-zinc-500";
  
  const score = getStabilityScore(sdwt);
  if (score >= 90) return "bg-gradient-to-r from-blue-500 to-indigo-500";
  if (score >= 70) return "bg-gradient-to-r from-emerald-500 to-teal-400";
  if (score >= 50) return "bg-gradient-to-r from-amber-400 to-orange-400";
  return "bg-gradient-to-r from-rose-500 to-red-400";
};

const getSdwtSeverity = (sdwt: SdwtData): "critical" | "warning" | "healthy" | "empty" => {
  if (isMoneyMode.value) return "healthy";
  if (sdwt.totalCount === 0) return "empty";
  if (sdwt.onlineCount === sdwt.totalCount) return "healthy";
  if (sdwt.onlineCount === 0) return "critical";
  return "warning";
};

const getSiteSeverity = (site: SiteData): "critical" | "warning" | "healthy" | "empty" => {
  if (isMoneyMode.value) return "healthy";
  if (site.siteStats.total === 0) return "empty";
  if (site.siteStats.online === site.siteStats.total) return "healthy";
  if (site.siteStats.online === 0) return "critical";
  return "warning";
};

const getSiteHealthDot = (site: SiteData) => {
  const severity = getSiteSeverity(site);
  if (severity === "critical") return "bg-rose-500 text-rose-500";
  if (severity === "warning") return "bg-amber-500 text-amber-500";
  if (severity === "empty") return "bg-slate-300 dark:bg-zinc-600 text-slate-300 dark:text-zinc-600";
  return "bg-emerald-500 text-emerald-500";
};

const getSiteGlowClass = (site: SiteData) => {
  if (isMoneyMode.value) return "bg-amber-300/40 dark:bg-amber-500/20";
  const severity = getSiteSeverity(site);
  if (severity === "critical") return "bg-rose-300/40 dark:bg-rose-500/15";
  if (severity === "warning") return "bg-amber-300/40 dark:bg-amber-500/15";
  if (severity === "empty") return "bg-slate-300/35 dark:bg-zinc-600/15";
  return "bg-emerald-300/40 dark:bg-emerald-500/10";
};

const getSiteBadgeClass = (site: SiteData) => {
  if (isMoneyMode.value) return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20";
  const severity = getSiteSeverity(site);
  if (severity === "critical") return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-400/20";
  if (severity === "warning") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20";
  if (severity === "empty") return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700";
  return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-400/20";
};

const getSdwtCardClass = (sdwt: SdwtData) => {
  if (isMoneyMode.value) return "border-amber-300 bg-gradient-to-br from-white to-amber-50/70 dark:border-amber-600/50 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.8),rgba(251,191,36,0.1))] hover:border-amber-400 dark:hover:border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.15)]";
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") return "border-rose-200 bg-gradient-to-br from-white to-rose-50/70 dark:border-rose-800/40 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(244,63,94,0.08))] hover:border-rose-300 dark:hover:border-rose-500/50";
  if (severity === "warning") return "border-amber-200 bg-gradient-to-br from-white to-amber-50/70 dark:border-amber-800/40 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(245,158,11,0.08))] hover:border-amber-300 dark:hover:border-amber-500/50";
  if (severity === "empty") return "border-slate-200 bg-gradient-to-br from-white to-slate-50/80 dark:border-zinc-800 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(39,39,42,0.8))] hover:border-slate-300 dark:hover:border-zinc-700";
  return "border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 dark:border-zinc-800 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(16,185,129,0.05))] hover:border-indigo-300 dark:hover:border-indigo-500/30";
};

const getSdwtGlowClass = (sdwt: SdwtData) => {
  if (isMoneyMode.value) return "bg-amber-400/40 dark:bg-amber-500/30";
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") return "bg-rose-300/45 dark:bg-rose-500/15";
  if (severity === "warning") return "bg-amber-300/45 dark:bg-amber-500/15";
  if (severity === "empty") return "bg-slate-300/35 dark:bg-zinc-600/15";
  return "bg-indigo-300/35 dark:bg-emerald-500/10";
};

const getSdwtMiniBadgeClass = (sdwt: SdwtData) => {
  if (isMoneyMode.value) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
  if (severity === "warning") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  if (severity === "empty") return "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
};

const getSdwtMiniBadgeDotClass = (sdwt: SdwtData) => {
  if (isMoneyMode.value) return "bg-amber-500";
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") return "bg-rose-500";
  if (severity === "warning") return "bg-amber-500";
  if (severity === "empty") return "bg-slate-400 dark:bg-zinc-500";
  return "bg-emerald-500";
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes halo-pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}
.animate-halo { animation: halo-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1); }

/* Show Me The Money Theme */
.money-theme :deep(.border-slate-200), .money-theme :deep(.dark\:border-zinc-800) {
  border-color: rgba(251, 191, 36, 0.4) !important;
}
.money-theme :deep(h1), .money-theme :deep(p.font-extrabold) {
  color: #fbbf24 !important; text-shadow: 0 0 8px rgba(251, 191, 36, 0.3) !important;
}
</style>

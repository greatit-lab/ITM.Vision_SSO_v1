<!-- frontend/src/views/GlobalDashboardView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div class="flex flex-col h-[calc(100vh-100px)] min-h-[600px] overflow-hidden">
      
      <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
        <div class="flex items-center gap-2">
          <div
            class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
          >
            <i class="text-lg text-indigo-500 pi pi-globe"></i>
          </div>

          <div class="flex items-baseline gap-2">
            <h1
              class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Global Fleet Dashboard
            </h1>
            <span
              class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
            >
              Integrated Site &amp; SDWT Topology
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
            <div class="flex items-center gap-1.5">
              <span class="relative flex w-1.5 h-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500"></span>
              </span>
              <span class="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">Live</span>
            </div>
            
            <div class="w-px h-3 bg-slate-200 dark:bg-zinc-700"></div>
            
            <span 
              class="text-[10px] font-mono font-bold w-[22px] text-center" 
              :class="isRefreshing ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-500 dark:text-zinc-400'"
            >
              {{ isRefreshing ? '...' : countdown + 's' }}
            </span>
          </div>

          <button
            @click="handleManualRefresh"
            :disabled="isRefreshing"
            class="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-all disabled:opacity-50"
          >
            <i class="pi pi-sync" :class="{ 'animate-spin': isRefreshing }"></i>
            <span class="hidden md:inline">Refresh Now</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 px-1 mb-5 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        
        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-indigo-200/40 dark:bg-indigo-500/15 blur-2xl"
          ></div>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Total Agents
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-slate-800 dark:text-white"
              >
                {{ globalStats.total }} <span class="text-sm font-bold text-slate-400 dark:text-slate-500">EA</span>
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-zinc-800/80 text-indigo-500 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-zinc-700"
            >
              <i class="pi pi-server text-base"></i>
            </div>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-emerald-200/40 dark:bg-emerald-500/15 blur-2xl"
          ></div>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Online
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400"
              >
                {{ globalStats.online }} <span class="text-sm font-bold text-emerald-500/70 dark:text-emerald-500/70">EA</span>
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-zinc-800/80 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-zinc-700"
            >
              <i class="pi pi-check-circle text-base"></i>
            </div>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-rose-200/40 dark:bg-rose-500/15 blur-2xl"
          ></div>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Offline
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-rose-600 dark:text-rose-400"
              >
                {{ globalStats.offline }} <span class="text-sm font-bold text-rose-500/70 dark:text-rose-500/70">EA</span>
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-zinc-800/80 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-zinc-700"
            >
              <i class="pi pi-times-circle text-base"></i>
            </div>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-amber-200/40 dark:bg-amber-500/15 blur-2xl"
          ></div>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Today Errors
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-amber-600 dark:text-amber-400"
              >
                {{ globalStats.alerts }} <span class="text-sm font-bold text-amber-500/70 dark:text-amber-500/70">Events</span>
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-zinc-800/80 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-zinc-700"
            >
              <i class="pi pi-bell text-base"></i>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isInitialLoading"
        class="flex flex-col items-center justify-center py-20 w-full"
      >
        <div
          class="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 shadow-sm"
        >
          <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
        </div>
        <p
          class="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400"
        >
          데이터를 불러오는 중입니다...
        </p>
      </div>

      <div
        v-else
        class="flex-1 overflow-y-auto custom-scrollbar px-1 pb-6"
      >
        <div
          v-if="globalData.length === 0"
          class="flex flex-col items-center justify-center min-h-[320px] rounded-3xl border border-dashed border-slate-300 dark:border-zinc-700 bg-white/50 dark:bg-black/20"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"
          >
            <i class="pi pi-inbox text-xl text-slate-400 dark:text-slate-500"></i>
          </div>
          <p
            class="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400"
          >
            표시할 데이터가 없습니다.
          </p>
        </div>

        <div
          v-else
          class="flex flex-wrap items-start gap-4"
        >
          <div
            v-for="site in globalData"
            :key="site.siteName"
            class="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] shadow-sm flex flex-col w-full sm:w-fit min-w-[100%] sm:min-w-[230px] max-w-full"
          >
            <div
              class="absolute right-[-32px] top-[-24px] w-28 h-28 rounded-full blur-3xl opacity-60 pointer-events-none"
              :class="getSiteGlowClass(site)"
            ></div>

            <div class="relative">
              <div
                class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-black/20"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span
                    class="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                    :class="getSiteHealthDot(site)"
                  ></span>

                  <div class="min-w-0 pr-4">
                    <h2
                      class="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white truncate"
                    >
                      {{ site.siteName }}
                    </h2>
                  </div>
                </div>

                <div
                  class="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border flex items-baseline gap-0.5"
                  :class="getSiteBadgeClass(site)"
                >
                  <span>{{ site.siteStats.online }} / {{ site.siteStats.total }}</span>
                  <span class="text-[9px] font-medium opacity-80">EA</span>
                </div>
              </div>

              <div class="px-4 pb-4 pt-3">
                <div
                  v-if="site.sdwts.length === 0"
                  class="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/30 px-4 py-6 text-center"
                >
                  <span
                    class="text-[11px] font-medium text-slate-400 dark:text-slate-500"
                  >
                    설정된 SDWT가 없습니다.
                  </span>
                </div>

                <div
                  v-else
                  class="flex flex-wrap justify-center gap-3"
                >
                  <button
                    v-for="sdwt in site.sdwts"
                    :key="sdwt.name"
                    type="button"
                    class="w-full sm:w-[190px] xl:w-[200px] shrink-0 group relative overflow-hidden text-left rounded-2xl border px-3 py-2.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                    :class="getSdwtCardClass(sdwt)"
                    @click="goToDetail(site.siteName, sdwt.name)"
                  >
                    <div
                      class="absolute left-[-22px] bottom-[-28px] w-24 h-24 rounded-full blur-2xl opacity-70 pointer-events-none"
                      :class="getSdwtGlowClass(sdwt)"
                    ></div>

                    <div class="relative">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <p
                            class="text-[13px] font-extrabold tracking-tight text-slate-800 dark:text-white truncate"
                          >
                            {{ sdwt.name }}
                          </p>
                          <p
                            class="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500"
                          >
                            {{ getSdwtSeverityText(sdwt) }}
                          </p>
                        </div>

                        <div class="flex flex-col items-end gap-1 shrink-0">
                          <span
                            class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                            :class="getSdwtMiniBadgeClass(sdwt)"
                          >
                            <span
                              class="w-1.5 h-1.5 rounded-full"
                              :class="getSdwtMiniBadgeDotClass(sdwt)"
                            ></span>
                            {{ getPercent(sdwt.onlineCount, sdwt.totalCount) }}%
                          </span>
                        </div>
                      </div>

                      <div class="mt-2 flex items-end justify-between">
                        <div>
                          <p
                            class="text-[10px] font-semibold text-slate-400 dark:text-slate-500"
                          >
                            Agent Status
                          </p>
                          <div class="mt-0.5 flex items-baseline gap-1">
                            <span
                              class="text-base font-extrabold text-slate-800 dark:text-white"
                            >
                              {{ sdwt.onlineCount }}
                            </span>
                            <span
                              class="text-xs font-bold text-slate-300 dark:text-zinc-600"
                            >
                              /
                            </span>
                            <span
                              class="text-xs font-bold text-slate-500 dark:text-slate-400"
                            >
                              {{ sdwt.totalCount }}
                            </span>
                          </div>
                        </div>

                        <div class="flex gap-1 shrink-0">
                          <span
                            v-if="sdwt.offlineCount > 0"
                            class="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/80 dark:border-rose-400/10"
                          >
                            OFF {{ sdwt.offlineCount }}
                          </span>
                          <span
                            v-if="sdwt.summary.todayErrorCount > 0"
                            class="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-400/10"
                          >
                            ERR {{ sdwt.summary.todayErrorCount }}
                          </span>
                        </div>
                      </div>

                      <div class="mt-2">
                        <div
                          class="flex justify-between items-center mb-1 text-[10px] font-semibold"
                        >
                          <span class="text-slate-400 dark:text-slate-500">
                            Availability
                          </span>
                          <span
                            class="text-slate-600 dark:text-slate-300"
                          >
                            {{ getPercent(sdwt.onlineCount, sdwt.totalCount) }}%
                          </span>
                        </div>

                        <div
                          class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden"
                        >
                          <div
                            class="h-full rounded-full transition-all duration-500"
                            :class="getSdwtProgressBarClass(sdwt)"
                            :style="{ width: `${getPercent(sdwt.onlineCount, sdwt.totalCount)}%` }"
                          ></div>
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
import { onMounted, onUnmounted, ref } from "vue";
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
  summary: DashboardSummaryDto;
  index: number;
}

interface SiteData {
  siteName: string;
  sdwts: SdwtData[];
  siteStats: {
    total: number;
    online: number;
    offline: number;
    alerts: number;
  };
  index: number;
}

const isInitialLoading = ref(true);
const isRefreshing = ref(false);
const globalData = ref<SiteData[]>([]);
const globalStats = ref({
  total: 0,
  online: 0,
  offline: 0,
  alerts: 0,
});

const countdown = ref(30);
let timerInterval: number | undefined;

const startTimer = () => {
  timerInterval = window.setInterval(() => {
    if (!isRefreshing.value) {
      countdown.value--;
      if (countdown.value <= 0) {
        countdown.value = 30;
        fetchAllData();
      }
    }
  }, 1000);
};

onMounted(() => {
  fetchAllData();
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

const handleManualRefresh = () => {
  countdown.value = 30;
  fetchAllData();
};

const fetchAllData = async () => {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  if (globalData.value.length === 0) {
    isInitialLoading.value = true;
  }

  try {
    const sites = await dashboardApi.getSites();

    let totalAgt = 0;
    let totalOn = 0;
    let totalOff = 0;
    let totalAlerts = 0;

    const sitePromises = sites.map(async (siteName, siteIndex) => {
      const sdwtsList = await dashboardApi.getSdwts(siteName);
      
      let siteTotal = 0;
      let siteOn = 0;
      let siteOff = 0;
      let siteAlerts = 0;

      const sdwtPromises = sdwtsList.map(async (sdwtName, sdwtIndex) => {
        try {
          const [summaryData, agentData] = await Promise.all([
            dashboardApi.getSummary(siteName, sdwtName),
            dashboardApi.getAgentStatus(siteName, sdwtName).catch(() => []),
          ]);

          const total = agentData?.length || 0;
          const online = agentData?.filter((a) => a.isOnline).length || 0;
          const offline = total - online;
          const alerts = summaryData?.todayErrorCount || 0;

          siteTotal += total;
          siteOn += online;
          siteOff += offline;
          siteAlerts += alerts;

          return {
            name: sdwtName,
            totalCount: total,
            onlineCount: online,
            offlineCount: offline,
            summary:
              summaryData ||
              ({
                todayErrorCount: 0,
              } as DashboardSummaryDto),
            index: sdwtIndex,
          };
        } catch (error) {
          console.error(`Fetch failed for ${siteName} - ${sdwtName}`, error);
          return null;
        }
      });

      const sdwtDataArrayRaw = await Promise.all(sdwtPromises);
      const sdwtDataArray = sdwtDataArrayRaw
        .filter((item): item is SdwtData => item !== null)
        .sort((a, b) => a.index - b.index);

      totalAgt += siteTotal;
      totalOn += siteOn;
      totalOff += siteOff;
      totalAlerts += siteAlerts;

      return {
        siteName,
        sdwts: sdwtDataArray,
        siteStats: {
          total: siteTotal,
          online: siteOn,
          offline: siteOff,
          alerts: siteAlerts,
        },
        index: siteIndex,
      };
    });

    const finalData = await Promise.all(sitePromises);

    globalData.value = finalData.sort((a, b) => a.index - b.index);

    globalStats.value = {
      total: totalAgt,
      online: totalOn,
      offline: totalOff,
      alerts: totalAlerts,
    };
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
  } finally {
    isInitialLoading.value = false;
    isRefreshing.value = false;
  }
};

const goToDetail = (siteName: string, sdwtName: string) => {
  filterStore.selectedSite = siteName;
  filterStore.selectedSdwt = sdwtName;

  localStorage.setItem("dashboard_site", siteName);
  localStorage.setItem("dashboard_sdwt", sdwtName);

  router.push({ name: "home" });
};

const getPercent = (part: number, total: number) => {
  return total === 0 ? 0 : Math.round((part / total) * 100);
};

const getSdwtSeverity = (sdwt: SdwtData): "critical" | "warning" | "healthy" | "empty" => {
  if (sdwt.totalCount === 0) return "empty";
  if (sdwt.onlineCount === sdwt.totalCount) return "healthy";
  if (sdwt.onlineCount === 0) return "critical";
  return "warning";
};

const getSiteSeverity = (site: SiteData): "critical" | "warning" | "healthy" | "empty" => {
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
  const severity = getSiteSeverity(site);
  if (severity === "critical") return "bg-rose-300/40 dark:bg-rose-500/15";
  if (severity === "warning") return "bg-amber-300/40 dark:bg-amber-500/15";
  if (severity === "empty") return "bg-slate-300/35 dark:bg-zinc-600/15";
  return "bg-emerald-300/40 dark:bg-emerald-500/10";
};

const getSiteBadgeClass = (site: SiteData) => {
  const severity = getSiteSeverity(site);
  if (severity === "critical") {
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-400/20";
  }
  if (severity === "warning") {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20";
  }
  if (severity === "empty") {
    return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700";
  }
  return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-400/20";
};

// 100% Online 이라는 중복 텍스트를 제거하고 기존의 Stable(안정됨) 상태를 반환하도록 원복
const getSdwtSeverityText = (sdwt: SdwtData) => {
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") return "All Offline";
  if (severity === "warning") return "Partial Offline / Alert";
  if (severity === "empty") return "No registered agent";
  return "Stable";
};

const getSdwtCardClass = (sdwt: SdwtData) => {
  const severity = getSdwtSeverity(sdwt);

  if (severity === "critical") {
    return "border-rose-200 bg-gradient-to-br from-white to-rose-50/70 dark:border-rose-800/40 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(244,63,94,0.08))] hover:border-rose-300 dark:hover:border-rose-500/50";
  }
  if (severity === "warning") {
    return "border-amber-200 bg-gradient-to-br from-white to-amber-50/70 dark:border-amber-800/40 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(245,158,11,0.08))] hover:border-amber-300 dark:hover:border-amber-500/50";
  }
  if (severity === "empty") {
    return "border-slate-200 bg-gradient-to-br from-white to-slate-50/80 dark:border-zinc-800 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(39,39,42,0.8))] hover:border-slate-300 dark:hover:border-zinc-700";
  }

  return "border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 dark:border-zinc-800 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.5),rgba(16,185,129,0.05))] hover:border-indigo-300 dark:hover:border-indigo-500/30";
};

const getSdwtGlowClass = (sdwt: SdwtData) => {
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") return "bg-rose-300/45 dark:bg-rose-500/15";
  if (severity === "warning") return "bg-amber-300/45 dark:bg-amber-500/15";
  if (severity === "empty") return "bg-slate-300/35 dark:bg-zinc-600/15";
  return "bg-indigo-300/35 dark:bg-emerald-500/10";
};

const getSdwtMiniBadgeClass = (sdwt: SdwtData) => {
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
  }
  if (severity === "warning") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  }
  if (severity === "empty") {
    return "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400";
  }
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
};

const getSdwtMiniBadgeDotClass = (sdwt: SdwtData) => {
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") return "bg-rose-500";
  if (severity === "warning") return "bg-amber-500";
  if (severity === "empty") return "bg-slate-400 dark:bg-zinc-500";
  return "bg-emerald-500";
};

const getSdwtProgressBarClass = (sdwt: SdwtData) => {
  const severity = getSdwtSeverity(sdwt);
  if (severity === "critical") {
    return "bg-gradient-to-r from-rose-500 to-rose-400";
  }
  if (severity === "warning") {
    return "bg-gradient-to-r from-amber-500 to-amber-400";
  }
  if (severity === "empty") {
    return "bg-gradient-to-r from-slate-400 to-slate-300 dark:from-zinc-600 dark:to-zinc-500";
  }
  return "bg-gradient-to-r from-emerald-500 to-cyan-500";
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.6);
  border-radius: 999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.85);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(63, 63, 70, 0.8);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(82, 82, 91, 1);
}
</style>

<!-- frontend/src/views/GlobalDashboardView.vue -->
<template>
  <div
    class="absolute inset-0 transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col overflow-hidden"
    :class="{ 'matrix-theme': isMatrixMode }"
  >
    <canvas
      v-if="isMatrixMode"
      ref="matrixCanvas"
      class="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-80"
    ></canvas>

    <div
      v-if="isMatrixMode"
      class="pointer-events-none absolute inset-0 z-[9999] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"
    ></div>

    <div class="relative z-10 flex flex-col flex-1 pt-2 overflow-hidden">
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
          <div
            class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors"
          >
            <div class="flex items-center gap-1.5">
              <span class="relative flex w-1.5 h-1.5">
                <span
                  class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"
                ></span>
                <span
                  class="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500"
                ></span>
              </span>
              <span
                class="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase"
                >Live</span
              >
            </div>

            <div class="w-px h-3 bg-slate-200 dark:bg-zinc-700"></div>

            <span
              class="text-[10px] font-mono font-bold w-[22px] text-center"
              :class="
                isRefreshing
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-zinc-400'
              "
            >
              {{ isRefreshing ? "..." : countdown + "s" }}
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

      <div
        class="grid grid-cols-1 gap-3 px-1 mb-5 md:grid-cols-2 lg:grid-cols-4 shrink-0"
      >
        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-indigo-200/40 dark:bg-indigo-500/15 blur-2xl"
          ></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Total Agents
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-slate-800 dark:text-white"
              >
                {{ globalStats.total }}
                <span
                  class="text-sm font-bold text-slate-400 dark:text-slate-500"
                  >EA</span
                >
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 text-indigo-500 border border-indigo-100 rounded-xl bg-indigo-50 dark:bg-zinc-800/80 dark:text-indigo-400 dark:border-zinc-700"
            >
              <i class="text-base pi pi-server"></i>
            </div>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-emerald-200/40 dark:bg-emerald-500/15 blur-2xl"
          ></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Online
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400"
              >
                {{ globalStats.online }}
                <span
                  class="text-sm font-bold text-emerald-500/70 dark:text-emerald-500/70"
                  >EA</span
                >
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 border rounded-xl bg-emerald-50 dark:bg-zinc-800/80 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-zinc-700"
            >
              <i class="text-base pi pi-check-circle"></i>
            </div>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-rose-200/40 dark:bg-rose-500/15 blur-2xl"
          ></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Offline
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-rose-600 dark:text-rose-400"
              >
                {{ globalStats.offline }}
                <span
                  class="text-sm font-bold text-rose-500/70 dark:text-rose-500/70"
                  >EA</span
                >
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 border rounded-xl bg-rose-50 dark:bg-zinc-800/80 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-zinc-700"
            >
              <i class="text-base pi pi-times-circle"></i>
            </div>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111111] px-4 py-3 shadow-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            class="absolute w-20 h-20 rounded-full -right-6 -top-6 bg-amber-200/40 dark:bg-amber-500/15 blur-2xl"
          ></div>
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p
                class="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500"
              >
                Today Errors
              </p>
              <p
                class="mt-0.5 text-2xl font-extrabold text-amber-600 dark:text-amber-400"
              >
                {{ globalStats.alerts }}
                <span
                  class="text-sm font-bold text-amber-500/70 dark:text-amber-500/70"
                  >Events</span
                >
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 border rounded-xl bg-amber-50 dark:bg-zinc-800/80 text-amber-500 dark:text-amber-400 border-amber-100 dark:border-zinc-700"
            >
              <i class="text-base pi pi-bell"></i>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isInitialLoading"
        class="flex flex-col items-center justify-center w-full py-20"
      >
        <div
          class="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 shadow-sm"
        >
          <i class="text-2xl text-indigo-500 pi pi-spin pi-spinner"></i>
        </div>
        <p class="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
          데이터를 불러오는 중입니다...
        </p>
      </div>

      <div v-else class="flex-1 px-1 pb-2 overflow-hidden">
        <div
          v-if="globalData.length === 0"
          class="flex flex-col items-center justify-center min-h-[320px] rounded-3xl border border-dashed border-slate-300 dark:border-zinc-700 bg-white/50 dark:bg-black/20"
        >
          <div
            class="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800"
          >
            <i
              class="text-xl pi pi-inbox text-slate-400 dark:text-slate-500"
            ></i>
          </div>
          <p
            class="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400"
          >
            표시할 데이터가 없습니다. (서버 연결을 확인해주세요)
          </p>
        </div>

        <div v-else class="flex flex-wrap items-start gap-4">
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
                class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-black/20"
              >
                <div class="flex items-center min-w-0 gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                    :class="getSiteHealthDot(site)"
                  ></span>

                  <div class="min-w-0 pr-4">
                    <h2
                      class="text-sm font-extrabold tracking-tight truncate text-slate-800 dark:text-white"
                    >
                      {{ site.siteName }}
                    </h2>
                  </div>
                </div>

                <div
                  class="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border flex items-baseline gap-0.5"
                  :class="getSiteBadgeClass(site)"
                >
                  <span
                    >{{ site.siteStats.online }} /
                    {{ site.siteStats.total }}</span
                  >
                  <span class="text-[9px] font-medium opacity-80">EA</span>
                </div>
              </div>

              <div class="px-4 pb-3 pt-2.5">
                <div
                  v-if="site.sdwts.length === 0"
                  class="px-4 py-5 text-center border border-dashed rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/30"
                >
                  <span
                    class="text-[11px] font-medium text-slate-400 dark:text-slate-500"
                  >
                    설정된 SDWT가 없습니다.
                  </span>
                </div>

                <div v-else class="flex flex-wrap justify-center gap-2.5">
                  <button
                    v-for="sdwt in site.sdwts"
                    :key="sdwt.name"
                    type="button"
                    class="w-full sm:w-[190px] xl:w-[200px] shrink-0 group relative overflow-hidden text-left rounded-2xl border px-3 py-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
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
                          <div class="flex items-center gap-1.5">
                            <div
                              v-if="sdwt.isAllLatest"
                              class="relative flex items-center justify-center w-[14px] h-[14px] rounded-full animate-halo shrink-0"
                            >
                              <i
                                class="absolute pi pi-verified text-blue-500 dark:text-blue-400 text-[14px]"
                                title="최신 버전 확산 완료"
                              ></i>
                            </div>
                            <p
                              class="text-[13px] font-extrabold tracking-tight text-slate-800 dark:text-white truncate"
                            >
                              {{ sdwt.name }}
                            </p>
                          </div>

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

                      <div class="flex items-end justify-between mt-2">
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
                          <span class="text-slate-600 dark:text-slate-300">
                            {{ getPercent(sdwt.onlineCount, sdwt.totalCount) }}%
                          </span>
                        </div>

                        <div
                          class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden"
                        >
                          <div
                            class="h-full transition-all duration-500 rounded-full"
                            :class="getSdwtProgressBarClass(sdwt)"
                            :style="{
                              width: `${getPercent(sdwt.onlineCount, sdwt.totalCount)}%`,
                            }"
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
  summary: DashboardSummaryDto;
  isAllLatest?: boolean;
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

// ============================================================================
// 매트릭스 디지털 비(Digital Rain) 캔버스 로직
// ============================================================================
const isMatrixMode = ref(false);
const matrixCanvas = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;
let drops: number[] = [];
const fontSize = 14;
const matrixChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*日ﾊミﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ".split(
    "",
  );

const startMatrixRain = () => {
  const canvas = matrixCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const columns = Math.floor(canvas.width / fontSize);
  drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }

  const draw = () => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text =
        matrixChars[Math.floor(Math.random() * matrixChars.length)] || "";
      const currentDrop = drops[i] ?? 0;

      ctx.fillText(text, i * fontSize, currentDrop * fontSize);

      if (currentDrop * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      } else {
        drops[i] = currentDrop + 1;
      }
    }
    animationFrameId = requestAnimationFrame(draw);
  };
  draw();
};

const stopMatrixRain = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};

// ============================================================================
// [수정됨] 코나미 커맨드 감지 및 DB 이스터에그 저장 로직 추가
// ============================================================================
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiPosition = 0;

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isMatrixMode.value) {
    isMatrixMode.value = false;
    konamiPosition = 0;
    stopMatrixRain();
    return;
  }

  const expectedKey = konamiCode[konamiPosition];

  if (expectedKey && e.key.toLowerCase() === expectedKey.toLowerCase()) {
    konamiPosition++;
    if (konamiPosition === konamiCode.length) {
      isMatrixMode.value = !isMatrixMode.value;
      konamiPosition = 0;

      if (isMatrixMode.value) {
        nextTick(() => startMatrixRain());
        // [핵심 추가] 매트릭스 모드가 켜지면 백엔드 API를 호출하여 이스터에그 사용 기록을 DB에 저장합니다.
        dashboardApi.saveEasterEgg({ eggType: "MATRIX", score: 0 }).catch(err => console.error("Easter Egg Logging Failed", err));
      } else {
        stopMatrixRain();
      }
    }
  } else {
    konamiPosition = 0;
    const firstKey = konamiCode[0];
    if (firstKey && e.key.toLowerCase() === firstKey.toLowerCase()) {
      konamiPosition = 1;
    }
  }
};

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
  window.addEventListener("keydown", handleKeydown);

  window.addEventListener("resize", () => {
    if (isMatrixMode.value && matrixCanvas.value) {
      matrixCanvas.value.width = window.innerWidth;
      matrixCanvas.value.height = window.innerHeight;
    }
  });
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  window.removeEventListener("keydown", handleKeydown);
  stopMatrixRain();
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
    const finalData = await dashboardApi.getGlobalFleetData();

    if (!finalData || !Array.isArray(finalData)) {
      console.warn("API Return Data is Invalid:", finalData);
      globalData.value = [];
      return;
    }

    globalData.value = finalData.sort(
      (a: SiteData, b: SiteData) => a.index - b.index,
    );

    let totalAgt = 0,
      totalOn = 0,
      totalOff = 0,
      totalAlerts = 0;
    finalData.forEach((site: SiteData) => {
      totalAgt += site.siteStats.total;
      totalOn += site.siteStats.online;
      totalOff += site.siteStats.offline;
      totalAlerts += site.siteStats.alerts;
    });

    globalStats.value = {
      total: totalAgt,
      online: totalOn,
      offline: totalOff,
      alerts: totalAlerts,
    };
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    globalData.value = [];
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

const getSdwtSeverity = (
  sdwt: SdwtData,
): "critical" | "warning" | "healthy" | "empty" => {
  if (sdwt.totalCount === 0) return "empty";
  if (sdwt.onlineCount === sdwt.totalCount) return "healthy";
  if (sdwt.onlineCount === 0) return "critical";
  return "warning";
};

const getSiteSeverity = (
  site: SiteData,
): "critical" | "warning" | "healthy" | "empty" => {
  if (site.siteStats.total === 0) return "empty";
  if (site.siteStats.online === site.siteStats.total) return "healthy";
  if (site.siteStats.online === 0) return "critical";
  return "warning";
};

const getSiteHealthDot = (site: SiteData) => {
  const severity = getSiteSeverity(site);
  if (severity === "critical") return "bg-rose-500 text-rose-500";
  if (severity === "warning") return "bg-amber-500 text-amber-500";
  if (severity === "empty")
    return "bg-slate-300 dark:bg-zinc-600 text-slate-300 dark:text-zinc-600";
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
/* ==========================================================================
   스크롤바 숨김 (기능은 유지하되 시각적으로만 제거)
   ========================================================================== */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes halo-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); /* Tailwind blue-500 */
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.animate-halo {
  animation: halo-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
}

/* ==========================================================================
   매트릭스 테마 (투명도 최적화 - 여러 겹의 어두운 배경 방지)
   ========================================================================== */
.matrix-theme {
  background-color: #000 !important; /* 최상단 배경만 완벽한 검은색 */
}

.matrix-theme :deep(*) {
  /* 하위 구조들의 배경은 모두 투명하게 비우기 */
  background-color: transparent !important;
  border-color: #00ff41 !important;
  color: #00ff41 !important;
  font-family: "Courier New", Courier, monospace !important;
  box-shadow: none !important;
}

/* 데이터가 담기는 카드 컨테이너에만 살짝 틴트를 주어 가독성 확보 */
.matrix-theme :deep(.rounded-3xl),
.matrix-theme :deep(.rounded-2xl),
.matrix-theme :deep(.rounded-xl) {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

/* 네온 효과 */
.matrix-theme :deep(h1),
.matrix-theme :deep(h2),
.matrix-theme :deep(p),
.matrix-theme :deep(span),
.matrix-theme :deep(i) {
  text-shadow: 0 0 4px #00ff41 !important;
  background-color: transparent !important;
}

/* 방해되는 꾸밈 요소들 숨기기 */
.matrix-theme :deep(.bg-gradient-to-br),
.matrix-theme :deep(.bg-gradient-to-r),
.matrix-theme :deep(.blur-2xl),
.matrix-theme :deep(.blur-3xl),
.matrix-theme :deep(.shadow-\[0_0_8px_currentColor\]) {
  background: none !important;
  display: none !important;
}

/* 프로그레스 바를 단색의 각진 터미널 스타일로 변경 */
.matrix-theme :deep(.rounded-full) {
  border-radius: 0 !important;
}
.matrix-theme :deep(.h-full.transition-all) {
  background-color: #00ff41 !important;
  border-right: 2px solid #000 !important;
}
</style>

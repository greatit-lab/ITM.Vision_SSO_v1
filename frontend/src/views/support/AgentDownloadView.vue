<!-- frontend/src/views/support/AgentDownloadView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans bg-[#F8FAFC] dark:bg-[#09090B] p-4 md:p-6 overflow-hidden relative"
  >
    <div
      v-if="isLoading"
      class="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm"
    >
      <i class="text-4xl text-indigo-500 pi pi-spin pi-spinner"></i>
    </div>

    <div class="flex items-center gap-3 mb-3 shrink-0 animate-fade-in">
      <div
        class="flex items-center justify-center w-10 h-10 border border-indigo-100 shadow-sm bg-indigo-50 rounded-xl dark:bg-indigo-900/20 dark:border-indigo-800"
      >
        <i class="text-xl text-indigo-600 pi pi-download dark:text-indigo-400"></i>
      </div>
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Agent Download
        </h1>
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
          System Agent & Extension Plugins
        </span>
      </div>
    </div>

    <div
      class="flex flex-col flex-1 min-h-0 gap-4 animate-fade-in"
      style="animation-delay: 0.1s"
    >
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 shrink-0">
        <div class="flex flex-col gap-4 lg:col-span-2">
          <div
            v-if="latestVersion"
            class="relative bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:px-8 md:pt-7 md:pb-7 shadow-sm overflow-hidden shrink-0 flex flex-col min-h-[245px]"
          >
            <div
              class="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full pointer-events-none bg-indigo-50 dark:bg-indigo-900/10 blur-3xl opacity-60"
            ></div>

            <div
              class="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-stretch h-full w-full"
            >
              <div class="flex flex-col justify-between flex-1 h-full">
                <div class="pt-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      class="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30 rounded-full uppercase tracking-wider"
                    >
                      Latest Agent Release
                    </span>
                    <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {{ latestVersion.version }}
                    </span>
                  </div>

                  <h2 class="mb-3 text-3xl font-black text-slate-800 dark:text-white">
                    ITM Agent for Windows
                  </h2>

                  <p
                    class="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400"
                  >
                    계측 장비의 실시간 모니터링 및 로그 수집을 책임지는 Agent
                    프로그램임. 최적화된 백그라운드 환경에서 구동되며 수집된
                    데이터는 I:Vision 시스템과 안전하게 동기화됩니다.
                  </p>
                </div>

                <div
                  class="flex flex-wrap items-center gap-4 mt-8 md:mt-auto pt-4 text-xs font-medium text-slate-400"
                >
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-calendar"></i>
                    {{ formatDate(latestVersion.releaseDate) }}
                  </div>
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-desktop"></i>
                    x86 / x64 Compatible
                  </div>
                  <div class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                    <i class="pi pi-verified"></i>
                    Stable Release
                  </div>
                </div>
              </div>

              <div
                class="flex flex-col justify-between w-full shrink-0 md:w-auto mt-4 md:mt-0 h-full"
              >
                <div class="flex flex-col justify-center flex-1 gap-3">
                  <button
                    @click="downloadFile(latestVersion.fileUrl64 || 'agent/ITM_Agent_Setup.exe')"
                    :disabled="isDownloading"
                    class="flex items-center justify-center gap-3 px-8 py-4 text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <i v-if="isDownloading" class="text-2xl pi pi-spin pi-spinner"></i>
                    <i v-else class="text-2xl pi pi-windows"></i>
                    <span class="flex items-baseline gap-1.5 text-lg font-extrabold tracking-tight">
                      Download Agent Standard
                      <span
                        v-if="latestVersion.fileSize64"
                        class="text-sm font-medium text-indigo-200 tracking-normal dark:text-indigo-300"
                      >
                        ({{ latestVersion.fileSize64 }})
                      </span>
                    </span>
                  </button>

                  <button
                    @click="
                      downloadFile(
                        latestVersion.fileUrlLegacy || 'agent/ITM_Agent_Setup_Net472.exe',
                      )
                    "
                    :disabled="isDownloading"
                    class="flex items-center justify-center gap-2.5 px-6 py-3 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <i
                      v-if="isDownloading"
                      class="text-lg text-slate-400 pi pi-spin pi-spinner"
                    ></i>
                    <i v-else class="text-lg text-slate-400 pi pi-download"></i>
                    <span class="flex items-baseline gap-1.5 text-sm font-bold">
                      Download for Win7+net4.7.2
                      <span
                        v-if="latestVersion.fileSizeLegacy"
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        ({{ latestVersion.fileSizeLegacy }})
                      </span>
                    </span>
                  </button>
                </div>

                <div
                  class="mt-5 md:mt-auto pt-4 text-center text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed"
                >
                  설치 환경에 따라
                  <code
                    class="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300"
                  >
                    .NET Framework 4.7.2
                  </code>
                  이상이 필요.
                  <button
                    @click="downloadFile('agent/NDP472-KB4054530-x86-x64-AllOS-ENU.exe')"
                    :disabled="isDownloading"
                    class="font-bold text-indigo-500 transition-colors ml-0.5 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    여기서 다운로드
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="px-6 pt-5 pb-4 bg-white border shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800 rounded-2xl shrink-0"
          >
            <div class="flex items-center gap-2 mb-4">
              <i class="text-lg text-amber-500 pi pi-bolt"></i>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white">
                Quick Start Guide
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                class="relative px-5 pt-4 pb-3 transition-colors border bg-slate-50 dark:bg-zinc-900/50 rounded-xl border-slate-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 group"
              >
                <div
                  class="absolute flex items-center justify-center w-8 h-8 font-black text-indigo-600 transition-transform bg-white border rounded-full shadow-sm -top-3 -left-3 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 dark:text-indigo-400 group-hover:scale-110"
                >
                  1
                </div>
                <div class="mt-1 text-center">
                  <i
                    class="mb-2 text-3xl transition-colors pi pi-cloud-download text-slate-300 dark:text-zinc-600 group-hover:text-indigo-400"
                  ></i>
                  <h4 class="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                    Downloading
                  </h4>
                  <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    운영체제 버전에 맞는 ITM Agent 설치 파일을 다운로드 받아 계측 장비 PC로
                    이동합니다.
                  </p>
                </div>
              </div>

              <div
                class="relative px-5 pt-4 pb-3 transition-colors border bg-slate-50 dark:bg-zinc-900/50 rounded-xl border-slate-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 group"
              >
                <div
                  class="absolute flex items-center justify-center w-8 h-8 font-black text-indigo-600 transition-transform bg-white border rounded-full shadow-sm -top-3 -left-3 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 dark:text-indigo-400 group-hover:scale-110"
                >
                  2
                </div>
                <div class="mt-1 text-center">
                  <i
                    class="mb-2 text-3xl transition-colors pi pi-shield text-slate-300 dark:text-zinc-600 group-hover:text-indigo-400"
                  ></i>
                  <h4 class="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                    Install Agent
                  </h4>
                  <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    다운로드한
                    <code
                      class="bg-slate-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300"
                    >
                      Setup.exe
                    </code>
                    파일을 관리자 권한으로 실행하여 설치를 진행합니다.
                  </p>
                </div>
              </div>

              <div
                class="relative px-5 pt-4 pb-3 transition-colors border bg-slate-50 dark:bg-zinc-900/50 rounded-xl border-slate-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 group"
              >
                <div
                  class="absolute flex items-center justify-center w-8 h-8 font-black text-indigo-600 transition-transform bg-white border rounded-full shadow-sm -top-3 -left-3 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 dark:text-indigo-400 group-hover:scale-110"
                >
                  3
                </div>
                <div class="mt-1 text-center">
                  <i
                    class="mb-2 text-3xl transition-colors pi pi-cog text-slate-300 dark:text-zinc-600 group-hover:text-indigo-400"
                  ></i>
                  <h4 class="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                    Configure & Start
                  </h4>
                  <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    설치 중 계측 장비의 EQPID 지정 및 데이터 아카이브 폴더를 선택 후
                    서비스를 시작합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-0 shadow-sm flex flex-col h-full w-full overflow-hidden min-h-[390px] max-h-[480px]"
        >
          <div
            class="flex items-center gap-2 p-4 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50"
          >
            <i class="pi pi-history text-slate-400"></i>
            <h3 class="text-sm font-bold tracking-wider text-slate-800 dark:text-white uppercase">
              Release History
            </h3>
            <span
              class="ml-auto text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/50"
            >
              All Highlights
            </span>
          </div>

          <div class="flex flex-col flex-1 gap-4 px-5 pt-5 pb-3 overflow-y-auto history-scroll min-h-0">
            <div
              v-for="(ver, index) in displayVersions"
              :key="ver.id"
              class="relative pl-5 border-l-2 shrink-0"
              :class="
                index === 0
                  ? 'border-indigo-300 dark:border-indigo-600'
                  : 'border-slate-200 dark:border-zinc-700'
              "
            >
              <div
                class="absolute rounded-full border-2 border-white dark:border-zinc-900 -left-[7px] top-0.5"
                :class="
                  index === 0
                    ? 'w-3 h-3 bg-indigo-500 animate-pulse'
                    : 'w-2.5 h-2.5 bg-slate-300 dark:bg-zinc-600 top-1 -left-[5.5px] border-none'
                "
              ></div>

              <div class="flex items-baseline justify-between mb-1.5">
                <h4
                  class="text-sm font-bold"
                  :class="
                    index === 0
                      ? 'text-indigo-700 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300'
                  "
                >
                  Agent {{ ver.version }}
                </h4>
                <span class="text-[10px] text-slate-400 font-mono font-medium">
                  {{ formatDate(ver.releaseDate) }}
                </span>
              </div>

              <ul
                class="ml-3 space-y-1 text-xs leading-relaxed list-disc list-outside"
                :class="
                  index === 0
                    ? 'text-slate-600 dark:text-slate-400'
                    : 'text-slate-500'
                "
              >
                <li
                  v-for="(feature, fIndex) in parseFeatures(ver.features)"
                  :key="fIndex"
                >
                  {{ feature }}
                </li>
              </ul>
            </div>

            <div class="pt-2 text-center border-t border-slate-100 dark:border-zinc-800/50 mt-auto shrink-0">
              <span class="text-[11px] text-slate-400 dark:text-slate-500">
                주요 릴리즈 노트만 노출됩니다. 상세 내역은 관리자 문의 바랍니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full mt-0 shrink-0">
        <div
          class="flex items-center justify-between px-1 pb-2 mb-3 border-b border-slate-200 dark:border-zinc-800"
        >
          <div class="flex items-center gap-2">
            <i class="text-xl text-indigo-500 pi pi-puzzle-piece"></i>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">
              Extension Plugins
            </h3>
          </div>
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">
            장비 특성에 맞춘 분석 모듈을 개별로 다운로드하세요.
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 pb-1 md:grid-cols-3 lg:grid-cols-5">
          <div
            v-for="plugin in plugins"
            :key="plugin.id"
            class="flex flex-col h-full p-4 transition-colors bg-white border shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-800/50 group min-h-[150px]"
          >
            <div class="flex items-start justify-between gap-2 mb-3 shrink-0">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <div
                  :class="`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${plugin.bg}`"
                >
                  <i :class="`pi ${plugin.icon} ${plugin.color} text-sm`"></i>
                </div>
                <h4
                  class="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate"
                  :title="plugin.name"
                >
                  {{ plugin.name }}
                </h4>
              </div>
              <span
                class="text-[9px] text-slate-400 font-mono tracking-wider bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              >
                {{ plugin.version }}
              </span>
            </div>

            <p
              class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3 flex-1"
              :title="plugin.description"
            >
              {{ plugin.description }}
            </p>

            <div class="flex justify-end mt-auto shrink-0">
              <button
                @click="downloadFile(plugin.filename)"
                :disabled="isDownloading"
                class="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-indigo-500 dark:bg-zinc-800 dark:hover:bg-indigo-600 text-slate-600 hover:text-white dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-600 font-bold rounded-lg text-[11px] transition-all disabled:opacity-50"
              >
                <i class="pi pi-download text-[11px]"></i>
                Get
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { agentApi, type AgentVersion, type AgentPlugin } from "@/api/agent";

const isDownloading = ref(false);
const isLoading = ref(true);

const versions = ref<AgentVersion[]>([]);
const plugins = ref<AgentPlugin[]>([]);

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER_URL || "";

onMounted(async () => {
  try {
    isLoading.value = true;

    const [versionsData, pluginsData] = await Promise.all([
      agentApi.getVersions().catch(() => []),
      agentApi.getPlugins().catch(() => []),
    ]);

    versions.value = versionsData;
    plugins.value = pluginsData;
  } catch (error) {
    console.error("데이터 로딩 실패:", error);
  } finally {
    isLoading.value = false;
  }
});

// [핵심 수정] 하드코딩된 .slice(0, 4) 갯수 제한 삭제
const displayVersions = computed(() => {
  return [...versions.value]
    .filter((v) => v.is_visible_y !== "N")
    .sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    );
});

const latestVersion = computed(() => {
  const sorted = [...versions.value].sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
  );

  return sorted.find((v) => v.isLatest === "Y") || sorted[0];
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseFeatures = (featuresStr: string) => {
  if (!featuresStr) return [];

  return featuresStr
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

const downloadFile = async (relativePath: string) => {
  if (isDownloading.value) return;

  isDownloading.value = true;

  try {
    const url = `${fileServerBaseUrl}/api/FileUpload/download?relativePath=${encodeURIComponent(relativePath)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", relativePath.split("/").pop() || "download.zip");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download error:", error);
    alert("파일 다운로드 중 오류가 발생했습니다. 서버 파일 경로를 확인해주세요.");
  } finally {
    isDownloading.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
  opacity: 0;
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-scroll::-webkit-scrollbar {
  width: 6px;
}

.history-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.history-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.history-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.dark .history-scroll::-webkit-scrollbar-thumb {
  background-color: #3f3f46;
}

.dark .history-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #52525b;
}
</style>

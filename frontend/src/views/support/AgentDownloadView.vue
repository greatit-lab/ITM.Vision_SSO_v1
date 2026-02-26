<!-- frontend/src/views/support/AgentDownloadView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans bg-[#F8FAFC] dark:bg-[#09090B] p-4 md:p-6 overflow-hidden"
  >
    <div class="flex items-center gap-3 mb-5 shrink-0 animate-fade-in">
      <div
        class="flex items-center justify-center w-10 h-10 border border-indigo-100 shadow-sm bg-indigo-50 rounded-xl dark:bg-indigo-900/20 dark:border-indigo-800"
      >
        <i
          class="text-xl text-indigo-600 pi pi-download dark:text-indigo-400"
        ></i>
      </div>
      <div>
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Agent Download
        </h1>
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
          System Agent & Extension Plugins
        </span>
      </div>
    </div>

    <div
      class="flex flex-col flex-1 min-h-0 gap-5 animate-fade-in"
      style="animation-delay: 0.1s"
    >
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3 shrink-0">
        <div class="flex flex-col gap-5 lg:col-span-2">
          <div
            class="relative bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden shrink-0"
          >
            <div
              class="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full pointer-events-none bg-indigo-50 dark:bg-indigo-900/10 blur-3xl opacity-60"
            ></div>

            <div
              class="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"
            >
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30 rounded-full uppercase tracking-wider"
                  >
                    Latest Agent Release
                  </span>
                  <span
                    class="text-sm font-semibold text-slate-500 dark:text-slate-400"
                    >v0.0.9.8</span
                  >
                </div>
                <h2
                  class="mb-3 text-3xl font-black text-slate-800 dark:text-white"
                >
                  ITM Agent for Windows
                </h2>
                <p
                  class="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400"
                >
                  설비 성능 모니터링 및 로그 수집을 위한 필수 에이전트
                  프로그램입니다. I:Vision 시스템과 안전하게 통신합니다.
                </p>

                <div
                  class="flex flex-wrap items-center gap-4 mt-5 text-xs font-medium text-slate-400"
                >
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-calendar"></i> 2026-03-01
                  </div>
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-file-zip"></i> 9.06 MB
                  </div>
                  <div
                    class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500"
                  >
                    <i class="pi pi-check-circle"></i> SHA-256 Verified
                  </div>
                </div>
              </div>

              <div
                class="flex flex-col w-full gap-2 mt-4 shrink-0 md:w-auto md:mt-0"
              >
                <button
                  @click="downloadFile('agent/ITM_Agent_Setup.exe')"
                  :disabled="isDownloading"
                  class="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <i
                    v-if="isDownloading"
                    class="text-xl pi pi-spin pi-spinner"
                  ></i>
                  <i v-else class="text-xl pi pi-windows"></i>
                  <span class="text-base">{{
                    isDownloading ? "Downloading..." : "Download Agent"
                  }}</span>
                </button>
                <span
                  class="text-[10px] text-center text-slate-400 font-medium"
                >
                  Requires Windows 7/10/11 or Server
                </span>
              </div>
            </div>
          </div>

          <div
            class="bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl px-6 pt-5 pb-4 shadow-sm shrink-0"
          >
            <div class="flex items-center gap-2 mb-4">
              <i class="text-lg pi pi-bolt text-amber-500"></i>
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
                  <h4
                    class="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    Downloading
                  </h4>
                  <p
                    class="text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                  >
                    최신 버전의 ITM Agent 설치 파일을 다운로드 받아 Intool 계측
                    장비 Server 에 설치를 진행합니다.
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
                  <h4
                    class="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    Install Agent
                  </h4>
                  <p
                    class="text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                  >
                    <code
                      class="bg-slate-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300"
                      >ITM_Agent_Setup</code
                    >
                    파일을 관리자 권한으로 설치를 진행합니다.
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
                  <h4
                    class="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    Configure & Start
                  </h4>
                  <p
                    class="text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                  >
                    ITM Agent 설치 중 계측 장비의 EQPID 지정 및 데이터 아카이브
                    폴더 경로를 선택 후 서비스를 시작합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-0 shadow-sm flex flex-col h-full overflow-hidden"
        >
          <div
            class="flex items-center gap-2 p-4 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50"
          >
            <i class="pi pi-history text-slate-400"></i>
            <h3
              class="text-sm font-bold tracking-wider uppercase text-slate-800 dark:text-white"
            >
              Release History
            </h3>
          </div>

          <div
            class="flex flex-col flex-1 gap-4 px-5 pt-5 pb-3 overflow-y-auto"
          >
            <div
              class="relative pl-5 border-l-2 border-indigo-300 dark:border-indigo-600"
            >
              <div
                class="absolute w-3 h-3 bg-indigo-500 border-2 border-white dark:border-zinc-900 rounded-full -left-[7px] top-0.5 animate-pulse"
              ></div>
              <div class="flex justify-between items-baseline mb-1.5">
                <h4
                  class="text-sm font-bold text-indigo-700 dark:text-indigo-400"
                >
                  Agent v0.0.9.8
                </h4>
                <span class="text-[10px] text-slate-400 font-mono font-medium"
                  >2026-03-01</span
                >
              </div>
              <ul
                class="ml-3 space-y-1 text-xs leading-relaxed list-disc list-outside text-slate-600 dark:text-slate-400"
              >
                <li>동적 플러그인(Plugin) 로딩 아키텍처 호환성 강화</li>
                <li>대용량 Wafer Map 데이터 전송 시 Timeout 예외 처리 추가</li>
                <li>
                  장기 구동 시 발생하는 메모리 누수(Memory Leak) 버그 완벽 수정
                </li>
              </ul>
            </div>

            <div
              class="relative pl-5 border-l-2 border-slate-200 dark:border-zinc-700"
            >
              <div
                class="absolute w-2.5 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded-full -left-[5.5px] top-1"
              ></div>
              <div class="flex justify-between items-baseline mb-1.5">
                <h4
                  class="text-sm font-bold text-slate-600 dark:text-slate-300"
                >
                  Agent v0.0.9.3
                </h4>
                <span class="text-[10px] text-slate-400 font-mono"
                  >2026-02-10</span
                >
              </div>
              <ul
                class="ml-3 space-y-1 text-xs leading-relaxed list-disc list-outside text-slate-500 dark:text-slate-500"
              >
                <li>
                  Onto 설비 특화 계측 데이터(Spectrum, Flatness) 수집 로직
                  최적화
                </li>
                <li>
                  Agent 백그라운드 구동 시 평균 CPU 점유율 최소화 (2% 미만 유지)
                </li>
              </ul>
            </div>

            <div
              class="relative pl-5 border-l-2 border-slate-200 dark:border-zinc-700"
            >
              <div
                class="absolute w-2.5 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded-full -left-[5.5px] top-1"
              ></div>
              <div class="flex justify-between items-baseline mb-1.5">
                <h4
                  class="text-sm font-bold text-slate-600 dark:text-slate-300"
                >
                  Agent v0.0.9.0
                </h4>
                <span class="text-[10px] text-slate-400 font-mono"
                  >2025-01-31</span
                >
              </div>
              <ul
                class="ml-3 space-y-1 text-xs leading-relaxed list-disc list-outside text-slate-500 dark:text-slate-500"
              >
                <li>초기 안정화 버전 릴리즈</li>
                <li>
                  네트워크 단절 대비 로컬 데이터 캐싱(Caching) 파일 암호화 적용
                </li>
                <li>
                  실시간 성능 데이터(CPU, Memory) 수집 주기 1초 단위 세밀화 지원
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full mt-1 shrink-0">
        <div
          class="flex items-center justify-between px-1 pb-2 mb-3 border-b border-slate-200 dark:border-zinc-800"
        >
          <div class="flex items-center gap-2">
            <i class="text-xl text-indigo-500 pi pi-puzzle-piece"></i>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">
              Extension Plugins
            </h3>
          </div>
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400"
            >장비 특성에 맞춘 분석 모듈을 개별로 다운로드하세요.</span
          >
        </div>

        <div class="grid grid-cols-2 gap-4 pb-2 md:grid-cols-3 lg:grid-cols-5">
          <div
            v-for="plugin in availablePlugins"
            :key="plugin.id"
            class="bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col hover:border-indigo-300 dark:hover:border-indigo-800/50 transition-colors group h-full"
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
                <i class="pi pi-download text-[11px]"></i> Get
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 다운로드 진행 상태 관리
const isDownloading = ref(false);

// [데이터 기반 UI] 요청하신 5개의 플러그인 라이브러리 목록
const availablePlugins = ref([
  {
    id: "waferflat-data",
    name: "Onto Wafer Flat Data",
    version: "v0.0.0.5",
    description:
      "Wafer 평탄도(Flatness), 두께(Thickness) 및 형상 계측 데이터를 처리하는 모듈입니다.",
    filename: "agent/plugins/Onto_WaferFlatDataLib.zip",
    icon: "pi-clone",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    id: "spectrum-data",
    name: "Onto Spectrum Data",
    version: "v0.0.0.5",
    description:
      "광학 스펙트럼 계측 데이터를 수집하고 파장별 분석을 지원하는 라이브러리입니다.",
    filename: "agent/plugins/Onto_SpectrumDataLib.zip",
    icon: "pi-chart-line",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    id: "wafermap-http",
    name: "Onto WaferMap Image",
    version: "v0.0.0.4",
    description:
      "계측 완료된 Wafer Map 이미지 및 좌표 데이터를 HTTP 프로토콜로 연동하는 플러그인입니다.",
    filename: "agent/plugins/Onto_WaferMapHttpLib.zip",
    icon: "pi-globe",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    id: "prealign-data",
    name: "Onto PreAlign Data",
    version: "v0.0.0.3",
    description:
      "Wafer PreAlign 정렬 데이터 및 Notch 변동 데이터를 추출하고 전송하는 모듈입니다.",
    filename: "agent/plugins/Onto_PrealignDataLib.zip",
    icon: "pi-compass",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "error-data",
    name: "Onto Error Data",
    version: "v0.0.0.5",
    description:
      "Onto 설비의 에러 및 알람 로그를 실시간으로 수집하고 분류하는 데이터 라이브러리입니다.",
    filename: "agent/plugins/Onto_ErrorDataLib.zip",
    icon: "pi-exclamation-triangle",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
]);

// Upload API 서버 주소
const uploadApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_URL || "http://10.172.111.93:8082";

/**
 * 브라우저 경고를 우회하기 위해 fetch & Blob 방식을 사용한 공통 다운로드 함수
 * @param relativePath 다운로드할 파일의 서버 내 상대 경로
 */
const downloadFile = async (relativePath: string) => {
  if (isDownloading.value) return;
  isDownloading.value = true;

  try {
    const url = `${uploadApiBaseUrl}/api/FileUpload/download?relativePath=${encodeURIComponent(relativePath)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute(
      "download",
      relativePath.split("/").pop() || "download.zip",
    );
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download error:", error);
    alert(
      "파일 다운로드 중 오류가 발생했습니다. 서버 파일 경로를 확인해주세요.",
    );
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

/* 카드 내 설명 텍스트가 3줄을 초과하면 ... 으로 처리되게 함 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

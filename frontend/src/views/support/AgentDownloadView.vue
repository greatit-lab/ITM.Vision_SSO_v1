<!-- frontend/src/views/support/AgentDownloadView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans bg-[#F8FAFC] dark:bg-[#09090B] p-4 md:p-6 overflow-y-auto">
    
    <div class="flex items-center gap-3 mb-6 shrink-0 animate-fade-in">
      <div class="flex items-center justify-center w-10 h-10 bg-indigo-50 border rounded-xl shadow-sm dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
        <i class="text-xl text-indigo-600 pi pi-download dark:text-indigo-400"></i>
      </div>
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Agent Download
        </h1>
        <span class="text-slate-500 dark:text-slate-400 font-medium text-xs">
          System Agent Installation & Setup Guide
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style="animation-delay: 0.1s;">
      
      <div class="lg:col-span-2 flex flex-col gap-6">
        
        <div class="relative bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mt-20 -mr-20 blur-3xl opacity-60 pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30 rounded-full uppercase tracking-wider">
                  Latest Release
                </span>
                <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">v0.0.9.8</span>
              </div>
              <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-3">
                ITM Agent for Windows
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                설비 성능 모니터링 및 로그 수집을 위한 필수 에이전트 프로그램입니다. 폐쇄망 환경에서도 I:Vision 서버와 안전하게 통신합니다.
              </p>
              
              <div class="flex flex-wrap items-center gap-4 mt-5 text-xs font-medium text-slate-400">
                <div class="flex items-center gap-1.5"><i class="pi pi-calendar"></i> 2026-02-26</div>
                <div class="flex items-center gap-1.5"><i class="pi pi-file-zip"></i> 9.06 MB</div>
                <div class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                  <i class="pi pi-check-circle"></i> SHA-256 Verified
                </div>
              </div>
            </div>

            <div class="shrink-0 flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
              <button 
                @click="downloadAgent('agent/ITM_Agent_Setup.exe')" 
                :disabled="isDownloading"
                class="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <i v-if="isDownloading" class="pi pi-spin pi-spinner text-xl"></i>
                <i v-else class="pi pi-windows text-xl"></i>
                <span class="text-sm">{{ isDownloading ? 'Downloading...' : 'Download (.exe)' }}</span>
              </button>
              <span class="text-[10px] text-center text-slate-400 font-medium">
                Requires Windows 7/10/11 or Server
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-5">
            <i class="pi pi-bolt text-amber-500"></i>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Quick Start Guide</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="relative p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-800 group">
              <div class="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full font-black text-indigo-600 dark:text-indigo-400 shadow-sm transition-transform group-hover:scale-110">1</div>
              <div class="mt-2 text-center">
                <i class="pi pi-cloud-download text-3xl text-slate-300 dark:text-zinc-600 mb-3 group-hover:text-indigo-400 transition-colors"></i>
                <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200 mb-2">Download & Extract</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">최신 버전의 ITM Agent 설치 파일을 Intool 계측 장비 Server 에 다운로드하고 해제합니다.</p>
              </div>
            </div>
            <div class="relative p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-800 group">
              <div class="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full font-black text-indigo-600 dark:text-indigo-400 shadow-sm transition-transform group-hover:scale-110">2</div>
              <div class="mt-2 text-center">
                <i class="pi pi-shield text-3xl text-slate-300 dark:text-zinc-600 mb-3 group-hover:text-indigo-400 transition-colors"></i>
                <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200 mb-2">Run as Admin</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <code class="bg-slate-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">ITM_Agent_Setup.exe</code> 파일을 관리자 권한으로 실행합니다.
                </p>
              </div>
            </div>
            <div class="relative p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 transition-colors hover:bg-white dark:hover:bg-zinc-800 group">
              <div class="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full font-black text-indigo-600 dark:text-indigo-400 shadow-sm transition-transform group-hover:scale-110">3</div>
              <div class="mt-2 text-center">
                <i class="pi pi-cog text-3xl text-slate-300 dark:text-zinc-600 mb-3 group-hover:text-indigo-400 transition-colors"></i>
                <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200 mb-2">Configure & Start</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">ITM Agent 설치 중 EQPID 입력 및 데이터 아카이브 경로를 선택 후 서비스를 시작합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-2xl p-0 shadow-sm flex flex-col h-full overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
          <i class="pi pi-history text-slate-400"></i>
          <h3 class="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Release History</h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          
          <div class="relative pl-5 border-l-2 border-indigo-300 dark:border-indigo-600">
            <div class="absolute w-3 h-3 bg-indigo-500 border-2 border-white dark:border-zinc-900 rounded-full -left-[7px] top-0.5 animate-pulse"></div>
            <div class="flex justify-between items-baseline mb-2">
              <h4 class="text-sm font-bold text-indigo-700 dark:text-indigo-400">v1.2.0 (Latest)</h4>
              <span class="text-[10px] text-slate-400 font-mono font-medium">2026-02-15</span>
            </div>
            <ul class="text-xs text-slate-600 dark:text-slate-400 list-disc list-outside ml-3 space-y-1.5 leading-relaxed">
              <li>Wafer PreAlign 데이터 실시간 수집 모듈 탑재</li>
              <li>장기 구동 시 발생하는 Memory Leak 버그 수정</li>
              <li>서버 통신 구간 TLS 1.2 보안 적용</li>
            </ul>
          </div>

          <div class="relative pl-5 border-l-2 border-slate-200 dark:border-zinc-700">
            <div class="absolute w-2.5 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded-full -left-[5.5px] top-1"></div>
            <div class="flex justify-between items-baseline mb-2">
              <h4 class="text-sm font-bold text-slate-600 dark:text-slate-300">v1.1.5</h4>
              <span class="text-[10px] text-slate-400 font-mono">2026-01-20</span>
            </div>
            <ul class="text-xs text-slate-500 dark:text-slate-500 list-disc list-outside ml-3 space-y-1.5 leading-relaxed">
              <li>네트워크 단절 시 데이터 로컬 캐싱 기능 강화 (최대 7일)</li>
              <li>CPU 점유율 최적화 (평균 2% 미만 유지)</li>
            </ul>
            <!-- <button @click="downloadAgent('agent/ITM_Agent_v1.1.5.zip')" class="mt-3 text-[11px] font-bold text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              <i class="pi pi-download"></i> Download legacy version
            </button> -->
          </div>

           <div class="relative pl-5 border-l-2 border-slate-200 dark:border-zinc-700">
            <div class="absolute w-2.5 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded-full -left-[5.5px] top-1"></div>
            <div class="flex justify-between items-baseline mb-2">
              <h4 class="text-sm font-bold text-slate-600 dark:text-slate-300">v1.1.0</h4>
              <span class="text-[10px] text-slate-400 font-mono">2025-12-05</span>
            </div>
            <ul class="text-xs text-slate-500 dark:text-slate-500 list-disc list-outside ml-3 space-y-1.5 leading-relaxed">
              <li>Lamp Life 모니터링 기능 추가</li>
              <li>초기 안정화 버전 릴리즈</li>
            </ul>
          </div>
          
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 다운로드 진행 상태 관리
const isDownloading = ref(false);

// [프로그래머 팁] Upload API 서버의 주소를 환경변수로 관리합니다. (.env 파일에 VITE_UPLOAD_API_URL 세팅 필요)
// 만약 설정되지 않았다면 기본 포트를 사용하도록 Fallback을 걸어둡니다.
const uploadApiBaseUrl = import.meta.env.VITE_UPLOAD_API_URL || 'http://10.172.111.93:8082';

/**
 * 브라우저 경고를 우회하기 위해 fetch & Blob 방식을 사용한 안전한 다운로드
 * @param relativePath 다운로드할 파일의 서버 내 상대 경로 (예: 'agent/ITM_Agent_v1.2.0.zip')
 */
const downloadAgent = async (relativePath: string) => {
  if (isDownloading.value) return; // 중복 클릭 방지
  isDownloading.value = true;
  
  try {
    const url = `${uploadApiBaseUrl}/api/FileUpload/download?relativePath=${encodeURIComponent(relativePath)}`;
    
    // 1. fetch를 통해 백그라운드에서 파일 데이터를 바이너리로 가져옴
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
    }

    // 2. 응답 데이터를 Blob(바이너리 데이터) 객체로 변환
    const blob = await response.blob();
    
    // 3. 브라우저 내부 메모리를 가리키는 안전한 로컬 URL 생성
    const blobUrl = window.URL.createObjectURL(blob);
    
    // 4. 가상의 a 태그를 생성하여 로컬 URL 클릭 이벤트 발생 (경고 없이 다운로드 됨)
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', relativePath.split('/').pop() || 'agent.zip'); 
    document.body.appendChild(link);
    link.click();
    
    // 5. 사용이 끝난 메모리 및 DOM 정리
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
  } catch (error) {
    console.error('Download error:', error);
    alert('파일 다운로드 중 오류가 발생했습니다. 서버 상태를 확인해주세요.');
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
</style>

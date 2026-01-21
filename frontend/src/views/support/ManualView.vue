<!-- frontend/src/views/support/ManualView.vue -->
<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-[#09090b]">
    <aside class="w-64 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-y-auto">
      <div class="p-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Documentation</h3>
        <nav class="space-y-1">
          <button 
            v-for="item in menuItems" 
            :key="item.id"
            @click="activeSection = item.id"
            class="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeSection === item.id 
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>

      <div class="p-4 mt-4 border-t border-slate-200 dark:border-zinc-800">
        <div class="bg-slate-100 dark:bg-zinc-800 rounded-xl p-4">
          <p class="text-xs font-semibold text-slate-500 mb-2">도움이 필요하신가요?</p>
          <p class="text-xs text-slate-400 mb-3">Q&A 게시판을 통해 관리자에게 문의하세요.</p>
          <button @click="$router.push('/support/qna')" class="w-full py-1.5 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-lg text-xs font-bold shadow-sm hover:text-indigo-500 transition-colors">
            Q&A 게시판 이동
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-8 scroll-smooth">
      <div class="max-w-4xl mx-auto space-y-12">
        
        <section id="overview" v-if="activeSection === 'overview'" class="animate-fade-in-up">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">시스템 개요 및 아키텍처</h1>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-8">
            <strong>I:Vision Web</strong> 플랫폼에 오신 것을 환영합니다.<br/>
            이 시스템은 현장의 반도체 장비(ITM Equipment)에서 생성되는 방대한 데이터를 <strong>ITM Agent</strong>를 통해 실시간으로 수집하고, 
            이를 분석하여 웹 대시보드 형태로 시각화해 주는 통합 모니터링 솔루션입니다.
          </p>

          <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800 mb-8">
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">System Architecture (시스템 구성도)</h3>
            <div class="flex flex-col md:flex-row items-center justify-between gap-6 text-center">
              <div class="flex-1 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <i class="pi pi-server text-4xl text-blue-500 mb-3"></i>
                <h4 class="font-bold text-slate-700 dark:text-slate-300">1. ITM Equipment</h4>
                <p class="text-xs text-slate-500 mt-2">데이터 생성<br/>(Agent 설치 필수)</p>
              </div>
              <i class="pi pi-arrow-right text-slate-300 text-xl hidden md:block"></i>
              <div class="flex-1 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <i class="pi pi-database text-4xl text-indigo-500 mb-3"></i>
                <h4 class="font-bold text-slate-700 dark:text-slate-300">2. DB Server</h4>
                <p class="text-xs text-slate-500 mt-2">데이터 저장 및 처리<br/>(Data Lake)</p>
              </div>
              <i class="pi pi-arrow-right text-slate-300 text-xl hidden md:block"></i>
              <div class="flex-1 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <i class="pi pi-desktop text-4xl text-emerald-500 mb-3"></i>
                <h4 class="font-bold text-slate-700 dark:text-slate-300">3. I:Vision Web</h4>
                <p class="text-xs text-slate-500 mt-2">데이터 시각화<br/>(현재 웹사이트)</p>
              </div>
            </div>
          </div>
        </section>

        <section id="download" v-if="activeSection === 'download'" class="animate-fade-in-up">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Downloads (자료실)</h2>
          
          <div class="grid gap-6 md:grid-cols-2">
            <div class="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i class="pi pi-download text-6xl text-indigo-600"></i>
              </div>
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <i class="pi pi-box text-xl"></i>
                </div>
                <div>
                  <h3 class="font-bold text-lg text-slate-800 dark:text-white">ITM Agent v1.0.5</h3>
                  <p class="text-xs text-slate-500">Latest release: 2026-01-20</p>
                </div>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[3rem] break-keep">
                장비 로그와 데이터 파일을 자동으로 수집하여 서버로 전송하는 백그라운드 서비스 프로그램입니다. (Windows 10/11 전용)
              </p>
              <button class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                <i class="pi pi-microsoft"></i> Windows용 다운로드
              </button>
            </div>

            <div class="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <i class="pi pi-file-pdf text-xl"></i>
                </div>
                <div>
                  <h3 class="font-bold text-lg text-slate-800 dark:text-white">통합 매뉴얼 (PDF)</h3>
                  <p class="text-xs text-slate-500">Size: 4.2 MB</p>
                </div>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[3rem] break-keep">
                Wafer Map 분석부터 관리자 설정 기능까지 모든 기능에 대한 상세 설명이 포함된 PDF 문서입니다.
              </p>
              <button class="w-full py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                <i class="pi pi-download"></i> PDF 다운로드
              </button>
            </div>
          </div>
        </section>

        <section id="dashboard" v-if="activeSection === 'dashboard'" class="animate-fade-in-up">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Dashboard Guide</h2>
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-slate-600 dark:text-slate-400">대시보드를 통해 다음의 핵심 지표들을 한눈에 모니터링할 수 있습니다:</p>
            <ul class="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong>Equipment Availability (장비 가동률):</strong> 실시간 장비 상태 (Run/Idle/Down) 및 가동 이력 확인.</li>
              <li><strong>Wafer Throughput (생산량):</strong> 시간별/일별 Wafer 처리 수량 집계.</li>
              <li><strong>Error Rates (에러 발생률):</strong> 발생한 알람(Alarm)의 빈도 및 심각도(Severity) 분석.</li>
            </ul>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeSection = ref('overview');

// 메뉴 항목: 용어(English) + 설명(Korean) 혼용 권장
const menuItems = [
  { id: 'overview', label: '개요 및 시스템 구성' },
  { id: 'dashboard', label: 'Dashboard 가이드' },
  { id: 'analysis', label: 'Wafer Analysis 분석' },
  { id: 'equipment', label: 'Equipment 장비 관리' },
  { id: 'download', label: '다운로드 (Agent/PDF)' },
];
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

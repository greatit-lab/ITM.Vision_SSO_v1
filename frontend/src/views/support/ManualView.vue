<!-- frontend/src/views/support/ManualView.vue -->
<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-[#09090b]">
    <aside class="w-64 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-y-auto">
      <div class="p-4">
        <div class="flex items-center justify-between mb-4 px-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Documentation</h3>
          <button 
            v-if="isAdmin" 
            @click="toggleEditMode" 
            class="text-xs px-2 py-0.5 rounded transition-colors"
            :class="isEditMode ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold' : 'text-slate-400 hover:text-indigo-500'"
            v-tooltip.top="'Toggle Admin Edit Mode'"
          >
            {{ isEditMode ? 'Exit Edit' : 'Edit' }}
          </button>
        </div>

        <nav class="space-y-1">
          <div v-for="(item, index) in manualSections" :key="item.id" class="relative group">
            <button 
              @click="activeSectionId = item.id"
              class="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between"
              :class="activeSectionId === item.id 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'"
            >
              <span class="truncate">{{ item.title }}</span>
              <i v-if="activeSectionId === item.id" class="pi pi-chevron-right text-[10px] opacity-50"></i>
            </button>
            
            <button 
              v-if="isEditMode" 
              @click.stop="deleteSection(index)"
              class="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 bg-white dark:bg-zinc-900 shadow-sm rounded border border-slate-100 dark:border-zinc-700 hidden group-hover:flex z-10"
              title="Delete Section"
            >
              <i class="pi pi-trash text-[10px]"></i>
            </button>
          </div>

          <button 
            v-if="isEditMode"
            @click="addSection"
            class="w-full mt-2 py-2 border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all text-xs flex items-center justify-center gap-1"
          >
            <i class="pi pi-plus"></i> Add New Section
          </button>
        </nav>
      </div>

      <div class="p-4 mt-auto border-t border-slate-200 dark:border-zinc-800">
        <div class="bg-slate-100 dark:bg-zinc-800 rounded-xl p-4">
          <p class="text-xs font-semibold text-slate-500 mb-2">도움이 필요하신가요?</p>
          <p class="text-xs text-slate-400 mb-3">Q&A 게시판을 통해 문의하세요.</p>
          <button @click="$router.push('/support/qna')" class="w-full py-1.5 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-lg text-xs font-bold shadow-sm hover:text-indigo-500 transition-colors">
            Q&A 게시판 이동
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-8 scroll-smooth relative">
      <div v-if="isEditMode && hasUnsavedChanges" class="fixed top-20 right-8 z-50 animate-bounce">
        <button 
          @click="saveChanges" 
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg font-bold text-sm transition-all"
        >
          <i class="pi pi-save"></i> Save Changes
        </button>
      </div>

      <div class="max-w-4xl mx-auto space-y-12">
        <transition name="fade" mode="out-in">
          <div :key="activeSectionId" class="animate-fade-in-up min-h-[500px]">
            
            <template v-if="!isEditMode">
              <div v-if="activeContent" class="space-y-6">
                <header class="border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                  <h1 class="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <i v-if="activeContent.icon" :class="activeContent.icon" class="text-indigo-500"></i>
                    {{ activeContent.title }}
                  </h1>
                  <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">{{ activeContent.subtitle }}</p>
                </header>

                <div v-if="activeContent.imageUrl" class="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm mb-8">
                  <img :src="activeContent.imageUrl" alt="Section Image" class="w-full h-auto object-cover bg-slate-50 dark:bg-black/20" />
                  <p v-if="activeContent.imageCaption" class="text-center text-xs text-slate-400 py-2 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                    {{ activeContent.imageCaption }}
                  </p>
                </div>

                <div class="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {{ activeContent.content }}
                </div>

                <div v-if="activeSectionId === 'download'" class="mt-8 grid gap-6 md:grid-cols-2">
                   <div class="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400"><i class="pi pi-box text-xl"></i></div>
                        <div><h3 class="font-bold text-lg text-slate-800 dark:text-white">ITM Agent v1.0.5</h3><p class="text-xs text-slate-500">Windows 10/11 (64bit)</p></div>
                      </div>
                      <button class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"><i class="pi pi-download"></i> Download</button>
                   </div>
                   <div class="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400"><i class="pi pi-file-pdf text-xl"></i></div>
                        <div><h3 class="font-bold text-lg text-slate-800 dark:text-white">System Manual PDF</h3><p class="text-xs text-slate-500">Updated: 2026.01</p></div>
                      </div>
                      <button class="w-full py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"><i class="pi pi-download"></i> Download</button>
                   </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="activeContent" class="bg-white dark:bg-zinc-900 rounded-xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
                <div class="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                  <button 
                    @click="editTab = 'write'"
                    class="px-6 py-3 text-sm font-bold transition-colors border-r border-slate-200 dark:border-zinc-800 flex items-center gap-2"
                    :class="editTab === 'write' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-b-transparent' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-zinc-200'"
                  >
                    <i class="pi pi-pencil"></i> Write
                  </button>
                  <button 
                    @click="editTab = 'preview'"
                    class="px-6 py-3 text-sm font-bold transition-colors border-r border-slate-200 dark:border-zinc-800 flex items-center gap-2"
                    :class="editTab === 'preview' ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border-b-2 border-b-transparent' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-zinc-200'"
                  >
                    <i class="pi pi-eye"></i> Preview
                  </button>
                  <div class="ml-auto px-4 py-2 flex items-center">
                     <span class="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded">ADMIN MODE</span>
                  </div>
                </div>

                <div v-show="editTab === 'write'" class="p-6 space-y-6">
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-xs font-bold text-slate-500">Section Title</label>
                      <input v-model="activeContent.title" class="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-xs font-bold text-slate-500">Subtitle</label>
                      <input v-model="activeContent.subtitle" class="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500">Icon Class (PrimeIcons)</label>
                    <div class="flex gap-2">
                      <input v-model="activeContent.icon" class="flex-1 p-2 text-sm border rounded bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. pi pi-home" />
                      <div class="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700 shrink-0">
                        <i :class="activeContent.icon"></i>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 flex justify-between">
                      <span>Section Image</span>
                      <span class="text-[10px] text-indigo-500 cursor-pointer hover:underline" @click="triggerFileInput">Upload File</span>
                    </label>
                    
                    <div 
                      class="relative border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-lg p-4 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      @paste="handleImagePaste"
                    >
                      <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleImageUpload" />
                      
                      <div class="flex flex-col md:flex-row gap-4 items-center">
                        <div v-if="activeContent.imageUrl" class="shrink-0 w-32 h-20 bg-slate-200 dark:bg-black/30 rounded overflow-hidden relative group">
                           <img :src="activeContent.imageUrl" class="w-full h-full object-cover" />
                           <button @click="activeContent.imageUrl = ''" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i class="pi pi-times text-[10px]"></i></button>
                        </div>
                        
                        <div class="flex-1 w-full space-y-2">
                           <input 
                             v-model="activeContent.imageUrl" 
                             class="w-full p-2 text-sm border rounded bg-white dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" 
                             placeholder="Paste image here (Ctrl+V) or enter URL..." 
                           />
                           <p class="text-[10px] text-slate-400">
                             * Tip: 이미지를 복사(Ctrl+C) 후 위 입력창을 클릭하고 붙여넣기(Ctrl+V) 하세요.
                           </p>
                        </div>
                      </div>
                    </div>
                    
                    <input v-model="activeContent.imageCaption" class="w-full p-2 text-xs border-b bg-transparent dark:border-zinc-700 focus:border-indigo-500 outline-none" placeholder="Image Caption (Optional)" />
                  </div>

                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500">Content (Markdown style)</label>
                    <textarea 
                      v-model="activeContent.content" 
                      rows="12" 
                      class="w-full p-3 text-sm border rounded bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none font-mono leading-relaxed resize-y"
                      placeholder="Enter manual content here..."
                    ></textarea>
                  </div>
                </div>

                <div v-show="editTab === 'preview'" class="p-8 min-h-[500px] bg-[#F8FAFC] dark:bg-[#09090B]">
                  <div class="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-6 bg-white dark:bg-transparent">
                    <div class="flex justify-center mb-4">
                       <span class="text-[10px] uppercase font-bold text-slate-300 tracking-widest">Live Preview</span>
                    </div>
                    
                    <header class="border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                      <h1 class="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <i v-if="activeContent.icon" :class="activeContent.icon" class="text-indigo-500"></i>
                        {{ activeContent.title }}
                      </h1>
                      <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">{{ activeContent.subtitle }}</p>
                    </header>

                    <div v-if="activeContent.imageUrl" class="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm mb-8">
                      <img :src="activeContent.imageUrl" alt="Preview" class="w-full h-auto object-cover" />
                      <p v-if="activeContent.imageCaption" class="text-center text-xs text-slate-400 py-2 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                        {{ activeContent.imageCaption }}
                      </p>
                    </div>

                    <div class="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {{ activeContent.content }}
                    </div>
                  </div>
                </div>

              </div>
            </template>

          </div>
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// --- State ---
const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER');
const isEditMode = ref(false);
const activeSectionId = ref('overview');
const hasUnsavedChanges = ref(false);
const editTab = ref<'write' | 'preview'>('write'); // Edit mode tab state
const fileInputRef = ref<HTMLInputElement | null>(null);

// --- Data Model ---
interface ManualSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
}

// 초기 데이터
const manualSections = reactive<ManualSection[]>([
  {
    id: 'overview',
    title: '개요 및 시스템 구성',
    subtitle: 'System Overview & Architecture',
    icon: 'pi pi-info-circle',
    imageUrl: 'https://placehold.co/1200x400/e2e8f0/475569?text=System+Architecture+Diagram',
    imageCaption: '* I:Vision System Architecture & Data Flow',
    content: `I:Vision Web 플랫폼에 오신 것을 환영합니다.
    
    이 시스템은 현장의 반도체 장비(ITM Equipment)에서 생성되는 방대한 데이터를 ITM Agent를 통해 실시간으로 수집하고, 이를 분석하여 웹 대시보드 형태로 시각화해 주는 통합 모니터링 솔루션입니다.
    
    사용자는 Wafer 단위의 정밀 계측 데이터부터 장비 PC의 리소스 상태까지 통합 모니터링할 수 있으며, 이상 발생 시 즉각적인 알림을 통해 공정 사고를 예방할 수 있습니다.`
  },
  {
    id: 'dashboard',
    title: 'Dashboard 가이드',
    subtitle: 'Overview Page Guide',
    icon: 'pi pi-th-large',
    content: `Overview 페이지는 접속 직후 사용자가 시스템의 전체적인 건강 상태(Health)를 한눈에 파악할 수 있는 관제탑 역할을 합니다.

    주요 모니터링 항목:
    1. Site Status Summary: 각 제조 Site별 장비 연결 상태 및 가동 현황 요약
    2. Equipment Utilization: 전체 장비의 가동률(Run), 유휴(Idle), 다운(Down) 상태 비율 차트
    3. Real-time Alarms: 현재 발생 중인 중요 알람(Error, Warning) 실시간 리스트
    4. Network & Agent Health: 데이터 수집 에이전트와 서버 간 통신 상태 (Green/Red)`
  },
  {
    id: 'analysis',
    title: 'Wafer Analysis 분석',
    subtitle: 'Wafer Metrology & Data Analytics',
    icon: 'pi pi-chart-pie',
    content: `Wafer Metrology 항목 아래의 각 페이지 기능 설명입니다.

    ■ Wafer Flat Data
    개별 Wafer의 평탄도(Flatness) 및 두께(Thickness) 계측 결과를 상세 조회합니다. 특정 Point를 클릭하면 해당 위치의 Wafer Map 이미지(PDF)와 Wave Spectrum 데이터를 연동하여 심층 분석할 수 있습니다.

    ■ Lot Uniformity Trend
    Lot 단위의 계측 균일도(Uniformity) 변화 추이를 시계열로 분석합니다. 주요 지표(StdDev, Range, %NonU)의 변동성을 모니터링하여 공정 산포가 흔들리는 시점을 포착합니다.

    ■ Spectrum Analysis
    광학 계측기에서 수집된 파장(Wavelength)별 반사율(Reflectance) 데이터를 분석합니다. 실측 데이터(EXP)와 모델링 데이터(GEN)를 비교하여 Model Fit (GOF) 수준을 검증할 수 있습니다.

    ■ Process Matching
    동일 공정을 수행하는 여러 장비(Chamber) 간의 성능 차이를 비교 분석합니다. 'Golden Chamber' 대비 타 장비의 계측 편차를 시각화하여 설비 간 매칭(OEE Matching) 작업을 지원합니다.`
  },
  {
    id: 'equipment',
    title: 'Equipment 장비 관리',
    subtitle: 'ITM Equipment Monitoring Guide',
    icon: 'pi pi-server',
    content: `ITM Monitoring 항목 아래의 각 페이지 기능 설명입니다.

    ■ ITM Equip Specs (Explorer)
    등록된 모든 ITM 장비의 하드웨어/소프트웨어 사양(Spec)을 관리합니다. Agent 버전, OS 정보, IP 주소 등 자산 정보를 통합 조회하고 변경 이력을 추적합니다.

    ■ Performance Trend
    장비 제어 PC의 리소스(CPU 사용량, 메모리 점유율, 온도, 팬 속도 등) 건전성을 모니터링합니다. PC 과부하로 인한 장비 멈춤(Hang)이나 오작동을 사전에 예방하기 위한 데이터입니다.

    ■ Process Memory
    특정 핵심 프로세스(예: ITM.exe, Vision.exe)의 메모리 누수(Memory Leak) 여부를 감시합니다. 시간 경과에 따른 메모리 증가 추이를 추적하여 소프트웨어 재시작 필요 시점을 판단합니다.

    ■ Lamp Lifetime
    계측기 광원(Lamp)의 누적 사용 시간과 남은 수명을 예측 관리합니다. 교체 주기를 자동으로 계산하여, 램프 노후화로 인한 계측 에러 발생을 방지합니다.`
  },
  {
    id: 'download',
    title: '다운로드 (자료실)',
    subtitle: 'Agent & Manual Download',
    icon: 'pi pi-download',
    content: `최신 버전의 Agent 설치 파일과 PDF 매뉴얼을 다운로드할 수 있습니다.
    
    ITM Agent 설치 시 주의사항:
    - Windows 10 이상 환경 권장
    - 방화벽 설정에서 8081 포트 허용 필요
    - 설치 후 서비스 자동 실행 여부 확인`
  }
]);

// --- Computed ---
const activeContent = computed(() => {
  return manualSections.find(s => s.id === activeSectionId.value);
});

// --- Methods ---
const toggleEditMode = () => {
  if (isEditMode.value && hasUnsavedChanges.value) {
    if (!confirm('저장하지 않은 변경사항이 있습니다. 저장하시겠습니까?')) {
      return; 
    } else {
      saveChanges();
    }
  }
  isEditMode.value = !isEditMode.value;
  editTab.value = 'write'; // Reset to write tab
};

const addSection = () => {
  const newId = `section-${Date.now()}`;
  manualSections.push({
    id: newId,
    title: 'New Section',
    subtitle: 'Enter subtitle here',
    icon: 'pi pi-file',
    content: 'Write your content here...'
  });
  activeSectionId.value = newId;
  hasUnsavedChanges.value = true;
};

const deleteSection = (index: number) => {
  if (confirm('Are you sure you want to delete this section?')) {
    manualSections.splice(index, 1);
    
    if (manualSections.length > 0) {
      const firstSection = manualSections[0];
      if (firstSection) activeSectionId.value = firstSection.id;
    }
    hasUnsavedChanges.value = true;
  }
};

const saveChanges = async () => {
  // TODO: 실제 Backend API 호출 (PUT /api/manual)
  console.log('Saving changes...', JSON.parse(JSON.stringify(manualSections)));
  setTimeout(() => {
    hasUnsavedChanges.value = false;
    alert('매뉴얼 내용이 저장되었습니다.');
    isEditMode.value = false;
  }, 500);
};

// --- Image Handling ---

// 1. File Input Click
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 2. Handle File Upload (Input Change)
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processImageFile(file);
  }
  // Reset input for re-selection
  target.value = '';
};

// 3. Handle Paste (Clipboard)
const handleImagePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      event.preventDefault(); // Prevent default paste behavior
      const file = item.getAsFile();
      if (file) {
        processImageFile(file);
      }
      break; 
    }
  }
};

// Common: Read File to Data URL
const processImageFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result && activeContent.value) {
      activeContent.value.imageUrl = e.target.result as string;
      // Also update caption if empty
      if (!activeContent.value.imageCaption) {
        activeContent.value.imageCaption = `* Image: ${file.name}`;
      }
    }
  };
  reader.readAsDataURL(file);
};

// 감지: 데이터 변경 시 unsaved flag 설정
watch(manualSections, () => {
  if (isEditMode.value) hasUnsavedChanges.value = true;
}, { deep: true });

</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

aside::-webkit-scrollbar {
  width: 4px;
}
aside::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}
</style>

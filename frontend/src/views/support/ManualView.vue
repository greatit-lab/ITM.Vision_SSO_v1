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

        <div v-if="isLoading" class="flex justify-center py-4">
           <i class="pi pi-spin pi-spinner text-indigo-500"></i>
        </div>

        <nav v-else class="space-y-1">
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
          :disabled="isSaving"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg font-bold text-sm transition-all disabled:opacity-50"
        >
          <i v-if="isSaving" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-save"></i> 
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
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
                  <img :src="activeContent.imageUrl" alt="Header Image" class="w-full h-auto object-cover bg-slate-50 dark:bg-black/20" />
                </div>

                <div 
                  class="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed view-content ql-editor !p-0 !overflow-visible"
                  v-html="activeContent.content"
                ></div>
              </div>
              <div v-else-if="!isLoading" class="flex items-center justify-center h-64 text-slate-400">
                 Select a section from the menu.
              </div>
            </template>

            <template v-else>
              <div v-if="activeContent" class="bg-white dark:bg-zinc-900 rounded-xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm relative overflow-hidden flex flex-col h-[800px]">
                
                <div class="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 shrink-0">
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
                  <div class="ml-auto px-4 py-2 flex items-center gap-2">
                     <span class="text-[10px] text-slate-400" v-if="editTab === 'write'">* Paste(Ctrl+V) images directly.</span>
                     <span class="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded">ADMIN MODE</span>
                  </div>
                </div>

                <div v-show="editTab === 'write'" class="p-6 space-y-4 overflow-y-auto flex-1 flex flex-col">
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-500">Section Title</label>
                      <input v-model="activeContent.title" class="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-slate-500">Subtitle</label>
                      <input v-model="activeContent.subtitle" class="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>

                  <div class="space-y-1 shrink-0">
                    <label class="text-xs font-bold text-slate-500">Header Image URL (Top Banner)</label>
                    <div class="flex gap-2">
                       <input v-model="activeContent.imageUrl" class="flex-1 p-2 text-sm border rounded bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
                       <button @click="triggerFileInput" class="px-3 py-2 bg-slate-200 dark:bg-zinc-700 rounded hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors" title="Upload Header Image">
                         <i class="pi pi-upload"></i>
                       </button>
                       <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleImageUpload" />
                    </div>
                  </div>

                  <div class="space-y-1 flex-1 flex flex-col min-h-0">
                    <label class="text-xs font-bold text-slate-500">Content Editor</label>
                    <div class="flex-1 border rounded-lg border-slate-300 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900 editor-wrapper">
                      <QuillEditor 
                        v-model:content="activeContent.content" 
                        contentType="html" 
                        theme="snow" 
                        :toolbar="customToolbar"
                        class="h-full"
                      />
                    </div>
                  </div>
                </div>

                <div v-show="editTab === 'preview'" class="p-8 overflow-y-auto flex-1 bg-[#F8FAFC] dark:bg-[#09090B]">
                  <div class="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-8 bg-white dark:bg-transparent min-h-full shadow-sm">
                    <header class="border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                      <h1 class="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <i v-if="activeContent.icon" :class="activeContent.icon" class="text-indigo-500"></i>
                        {{ activeContent.title }}
                      </h1>
                      <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">{{ activeContent.subtitle }}</p>
                    </header>

                    <div v-if="activeContent.imageUrl" class="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm mb-8">
                      <img :src="activeContent.imageUrl" alt="Preview Header" class="w-full h-auto object-cover" />
                    </div>

                    <div 
                      class="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed view-content ql-editor !p-0 !overflow-visible"
                      v-html="activeContent.content"
                    ></div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
// [수정] 정확한 API 파일 경로와 DTO import
import { manualApi, type ManualSectionDto } from '@/api/manual';

const authStore = useAuthStore();

// --- State ---
const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER');
const isEditMode = ref(false);
const activeSectionId = ref('');
const hasUnsavedChanges = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const editTab = ref<'write' | 'preview'>('write'); 
const fileInputRef = ref<HTMLInputElement | null>(null);

// Quill Custom Toolbar
const customToolbar = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['link', 'image', 'code-block'],
  ['clean']
];

// Data Model (Initial Data used if DB is empty)
const defaultSections: ManualSectionDto[] = [
  {
    id: 'overview',
    title: '개요 및 시스템 구성',
    subtitle: 'System Overview & Architecture',
    icon: 'pi pi-info-circle',
    content: `<p><strong>I:Vision Web</strong> 플랫폼에 오신 것을 환영합니다.</p><br/><p>이 시스템은 현장의 반도체 장비(ITM Equipment)에서 생성되는 방대한 데이터를 ITM Agent를 통해 실시간으로 수집합니다.</p>`,
    imageUrl: '',
    sortOrder: 0
  },
  {
    id: 'dashboard',
    title: 'Dashboard 가이드',
    subtitle: 'Overview Page Guide',
    icon: 'pi pi-th-large',
    content: `<p>Overview 페이지는 접속 직후 사용자가 시스템의 전체적인 건강 상태(Health)를 한눈에 파악할 수 있는 관제탑 역할을 합니다.</p>`,
    imageUrl: '',
    sortOrder: 1
  }
];

const manualSections = ref<ManualSectionDto[]>([]);

// --- Lifecycle ---
onMounted(async () => {
  await loadManuals();
});

const loadManuals = async () => {
  isLoading.value = true;
  try {
    const data = await manualApi.getAll();
    if (data && data.length > 0) {
      manualSections.value = data;
    } else {
      // DB가 비어있으면 기본값 사용
      manualSections.value = JSON.parse(JSON.stringify(defaultSections));
    }
    
    // [수정] 배열 안전 접근 (undefined 체크)
    if (manualSections.value.length > 0) {
      const firstSection = manualSections.value[0];
      if (firstSection) {
        activeSectionId.value = firstSection.id;
      }
    }
  } catch (e) {
    console.error('Failed to load manuals:', e);
    manualSections.value = JSON.parse(JSON.stringify(defaultSections));
    if (manualSections.value.length > 0) {
       const firstSection = manualSections.value[0];
       if (firstSection) activeSectionId.value = firstSection.id;
    }
  } finally {
    isLoading.value = false;
  }
};

// --- Computed ---
const activeContent = computed(() => {
  // [수정] 타입 명시를 통해 'implicit any' 오류 해결
  return manualSections.value.find((s: ManualSectionDto) => s.id === activeSectionId.value);
});

// --- Methods ---
const toggleEditMode = () => {
  if (isEditMode.value && hasUnsavedChanges.value) {
    if (!confirm('저장하지 않은 변경사항이 있습니다. 저장하시겠습니까?')) return;
    saveChanges();
  }
  isEditMode.value = !isEditMode.value;
  editTab.value = 'write'; 
};

const addSection = () => {
  const newId = `section-${Date.now()}`;
  manualSections.value.push({
    id: newId,
    title: 'New Section',
    subtitle: 'Enter subtitle here',
    icon: 'pi pi-file',
    content: '<p>Write content here...</p>',
    imageUrl: '',
    sortOrder: manualSections.value.length
  });
  activeSectionId.value = newId;
  hasUnsavedChanges.value = true;
};

const deleteSection = (index: number) => {
  if (confirm('Are you sure you want to delete this section?')) {
    manualSections.value.splice(index, 1);
    
    if (manualSections.value.length > 0) {
      // [수정] 배열 안전 접근
      const firstSection = manualSections.value[0];
      if (firstSection) activeSectionId.value = firstSection.id;
    } else {
        activeSectionId.value = '';
    }
    hasUnsavedChanges.value = true;
  }
};

const saveChanges = async () => {
  isSaving.value = true;
  try {
    // 실제 Backend API 호출
    await manualApi.saveAll(manualSections.value);
    
    hasUnsavedChanges.value = false;
    alert('매뉴얼 내용이 성공적으로 저장되었습니다.');
    isEditMode.value = false;
  } catch (e) {
    console.error('Failed to save manuals:', e);
    alert('저장 중 오류가 발생했습니다.');
  } finally {
    isSaving.value = false;
  }
};

// --- Image Handling (For Header Image) ---
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processImageFile(file);
  }
  target.value = '';
};

const processImageFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result && activeContent.value) {
      activeContent.value.imageUrl = e.target.result as string;
      hasUnsavedChanges.value = true;
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

/* Quill Editor Custom Layout */
.editor-wrapper {
  display: flex;
  flex-direction: column;
}
:deep(.ql-toolbar) {
  border-color: #e2e8f0 !important;
  background-color: #f8fafc;
  flex-shrink: 0;
}
:deep(.ql-container) {
  border-color: #e2e8f0 !important;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  flex: 1;
  overflow: hidden;
  font-family: inherit;
}
:deep(.ql-editor) {
  height: 100%;
  overflow-y: auto;
}

/* Dark Mode Overrides for Quill */
:deep(html.dark .ql-toolbar) {
  border-color: #27272a !important;
  background-color: #18181b;
}
:deep(html.dark .ql-toolbar .ql-stroke) { stroke: #a1a1aa; }
:deep(html.dark .ql-toolbar .ql-fill) { fill: #a1a1aa; }
:deep(html.dark .ql-toolbar .ql-picker) { color: #a1a1aa; }
:deep(html.dark .ql-container) { border-color: #27272a !important; color: #e4e4e7; }
</style>

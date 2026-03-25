<!-- frontend/src/views/support/QnaWriteView.vue -->
<template>
  <div class="h-full flex flex-col w-full bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
    
    <div class="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
      <button 
        @click="$router.back()"
        class="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-indigo-600 transition-colors shadow-sm shrink-0"
      >
        <i class="pi pi-arrow-left text-xs"></i>
      </button>
      <h1 class="text-base font-bold text-slate-900 dark:text-white">
        {{ isEditMode ? '게시글 수정' : '새 질문/의견 작성' }}
      </h1>
    </div>

    <div v-if="isLoadingData" class="flex-1 flex items-center justify-center">
       <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
    </div>

    <form v-else @submit.prevent="submitPost" class="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      
      <div class="flex-1 flex flex-col p-4 gap-4 min-h-0 relative z-10">
        
        <div class="grid gap-4 md:grid-cols-[1fr_200px] shrink-0">
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500 uppercase">제목</label>
            <input 
              v-model="form.title"
              type="text" 
              required
              placeholder="제목을 입력하세요" 
              class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 transition-all font-medium text-sm text-slate-900 dark:text-white"
            >
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500 uppercase">카테고리</label>
            <select 
              v-model="form.category"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 transition-all font-medium text-sm text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="QNA">Q&A (질문)</option>
              <option value="BUG">Bug Report (버그)</option>
              <option value="IDEA">Idea (의견 제안)</option> 
              <option value="NOTICE" v-if="isAdmin">Notice (공지)</option>
            </select>
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0 space-y-1">
          <div class="flex justify-between items-end shrink-0">
             <label class="text-[11px] font-bold text-slate-500 uppercase">내용</label>
             <p class="text-[10px] text-slate-400">* 캡처 이미지를 붙여넣을 수 있습니다 (Ctrl+V)</p>
          </div>
          
          <div class="flex-1 editor-wrapper bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 flex flex-col min-h-0 relative">
            
            <QuillEditor 
              ref="myQuillEditor"
              v-model:content="form.content" 
              contentType="html"
              theme="snow"
              toolbar="#custom-toolbar"
              @ready="onEditorReady"
              placeholder="내용을 입력하세요..."
              class="flex-1 min-h-0 flex flex-col" 
            >
              <template #toolbar>
                <div id="custom-toolbar" class="flex items-center flex-wrap gap-1">
                  
                  <div class="relative flex items-center mr-2 z-[60]" ref="dropdownRef">
                    
                    <span class="ql-formats !mr-0 flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-l-md px-1.5 h-[26px]"
                          @mousedown.stop @click.stop @keydown.stop>
                      <input
                        type="number"
                        v-model="fontSizeInput"
                        @change="applyFontSize"
                        @keydown.enter.prevent="applyFontSize"
                        class="w-8 text-xs font-mono font-bold text-center outline-none bg-transparent text-indigo-600 dark:text-indigo-400 pl-0.5"
                        min="8" max="72"
                        title="크기를 직접 입력하거나 화살표를 눌러 선택하세요"
                      />
                      <span class="text-[10px] font-bold text-slate-400 select-none">px</span>
                    </span>

                    <button
                      type="button"
                      class="h-[26px] px-1.5 border-y border-r border-slate-200 dark:border-zinc-700 rounded-r-md bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                      @click.stop="isFontSizeDropdownOpen = !isFontSizeDropdownOpen"
                      @mousedown.stop
                    >
                      <i class="pi pi-chevron-down text-[9px] text-slate-500"></i>
                    </button>

                    <div v-if="isFontSizeDropdownOpen"
                         class="absolute top-full left-0 mt-1 w-[74px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 max-h-[220px] overflow-y-auto custom-scrollbar"
                         @mousedown.stop @click.stop>
                      <button v-for="size in [10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 30, 36]" :key="size"
                              type="button"
                              class="w-full text-left px-3 py-1.5 text-[11px] font-mono transition-colors flex items-center justify-between"
                              :class="fontSizeInput === size ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700'"
                              @click="selectFontSize(size)">
                        <span>{{ size }}</span>
                        <span class="text-[9px] text-slate-400 dark:text-zinc-500 font-sans" v-if="fontSizeInput === size">✓</span>
                      </button>
                    </div>
                  </div>

                  <div class="w-px h-4 bg-slate-200 dark:bg-zinc-700 mr-2"></div>

                  <span class="ql-formats">
                    <select class="ql-header">
                      <option value="1"></option>
                      <option value="2"></option>
                      <option value="3"></option>
                      <option selected></option>
                    </select>
                  </span>

                  <span class="ql-formats">
                    <button type="button" class="ql-bold"></button>
                    <button type="button" class="ql-italic"></button>
                    <button type="button" class="ql-underline"></button>
                    <button type="button" class="ql-strike"></button>
                  </span>
                  
                  <span class="ql-formats">
                    <select class="ql-color"></select>
                    <select class="ql-background"></select>
                  </span>
                  
                  <span class="ql-formats">
                    <button type="button" class="ql-list" value="ordered"></button>
                    <button type="button" class="ql-list" value="bullet"></button>
                  </span>
                  
                  <span class="ql-formats">
                    <button type="button" class="ql-link"></button>
                    <button type="button" class="ql-image"></button>
                  </span>
                  
                  <span class="ql-formats">
                    <button type="button" class="ql-clean"></button>
                  </span>
                </div>
              </template>
            </QuillEditor>

          </div>
        </div>

      </div>

      <div class="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shrink-0 z-20 relative">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isSecret" 
              v-model="form.isSecret"
              true-value="Y"
              false-value="N"
              class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            >
            <label for="isSecret" class="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none flex items-center gap-1.5">
              <i class="pi pi-lock text-[10px]"></i> 비밀글
            </label>
          </div>

          <div v-if="isAdmin && form.category === 'NOTICE'" class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isPopup" 
              v-model="form.isPopup"
              true-value="Y"
              false-value="N"
              class="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
            >
            <label for="isPopup" class="text-xs font-bold text-rose-600 cursor-pointer select-none flex items-center gap-1.5">
              <i class="pi pi-megaphone text-[10px]"></i> 팝업 공지
            </label>
          </div>
        </div>

        <div class="flex gap-2">
          <button 
            type="button" 
            @click="$router.back()"
            class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
          >
            취소
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
            {{ isSubmitting ? '저장 중...' : (isEditMode ? '수정 완료' : '등록하기') }}
          </button>
        </div>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { boardApi } from '@/api/board';
import { QuillEditor, Quill } from '@vueup/vue-quill';

const SizeStyle = Quill.import('attributors/style/size');
SizeStyle.canAdd = function() { return true; };
Quill.register(SizeStyle, true);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isSubmitting = ref(false);
const isLoadingData = ref(false);
const isEditMode = ref(false);
const targetId = ref(0);

const myQuillEditor = ref<any>(null);

const fontSizeInput = ref<number | string>(13); 
const isFontSizeDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const savedRange = ref<{ index: number, length: number } | null>(null);

const form = reactive({
  title: '',
  category: 'QNA',
  content: '',
  isSecret: 'N',
  isPopup: 'N'
});

const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER');

const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isFontSizeDropdownOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('mousedown', closeDropdown);

  if (route.query.id) {
    isEditMode.value = true;
    targetId.value = Number(route.query.id);
    await loadPostData(targetId.value);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closeDropdown);
});

const loadPostData = async (id: number) => {
  isLoadingData.value = true;
  try {
    const res = await boardApi.getPost(id);
    const post = res.data;
    
    form.title = post.title;
    form.category = post.category;
    form.content = post.content;
    form.isSecret = post.isSecret;
    form.isPopup = post.isPopup || 'N'; 
    
    const currentUserId = authStore.user?.userId;
    const isAuthor = String(post.authorId) === String(currentUserId);
    if (!isAuthor && !isAdmin.value) {
      alert("수정 권한이 없습니다.");
      router.back();
    }
  } catch (e) {
    console.error(e);
    alert("게시글 정보를 불러오지 못했습니다.");
    router.back();
  } finally {
    isLoadingData.value = false;
  }
};

const submitPost = async () => {
  if (!form.title.trim() || !form.content.trim()) {
    alert("제목과 내용을 모두 입력해 주세요.");
    return;
  }
  
  if (form.content === '<p><br></p>') {
    alert("내용을 입력해 주세요.");
    return;
  }

  isSubmitting.value = true;
  try {
    const authorId = authStore.user?.userId || 'anonymous';
    
    if (isEditMode.value) {
      await boardApi.updatePost(targetId.value, { ...form });
      alert("게시글이 수정되었습니다.");
      router.push({ name: 'qna-detail', params: { id: targetId.value } });
    } else {
      await boardApi.createPost({ ...form, authorId });
      alert("게시글이 등록되었습니다.");
      router.push({ name: 'qna-list' });
    }
  } catch (e) {
    console.error(e);
    alert("요청 처리 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const onEditorReady = (quill: any) => {
  quill.on('selection-change', (range: any) => {
    if (range) {
      savedRange.value = range;
      
      let format = quill.getFormat(range.index, range.length);
      if (range.length === 0) format = quill.getFormat(); 

      if (format.size) {
        const sizeStr = Array.isArray(format.size) ? format.size[0] : format.size;
        const sizeNum = parseInt(sizeStr.replace('px', ''), 10);
        if (!isNaN(sizeNum)) {
          fontSizeInput.value = sizeNum;
        }
      } else {
        fontSizeInput.value = 14; 
      }
    }
  });
};

const applyFontSize = () => {
  if (!myQuillEditor.value) return;
  const quill = myQuillEditor.value.getQuill();
  
  let size = Number(fontSizeInput.value);
  if (isNaN(size) || size < 8) size = 8;
  if (size > 72) size = 72;

  let range = savedRange.value || { index: 0, length: 0 };
  
  quill.focus();
  quill.setSelection(range.index, range.length);

  if (range.length > 0) {
    quill.formatText(range.index, range.length, 'size', `${size}px`, 'user');
  } else {
    quill.format('size', `${size}px`, 'user');
  }

  fontSizeInput.value = size; 
  isFontSizeDropdownOpen.value = false; 
};

const selectFontSize = (size: number) => {
  fontSizeInput.value = size;
  applyFontSize();
};
</script>

<style scoped>
#custom-toolbar {
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 12px;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #52525b; }

:deep(.ql-toolbar) {
  border-color: #e2e8f0 !important;
  background-color: #f8fafc;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  flex-shrink: 0;
}
:deep(.ql-container) {
  border-color: #e2e8f0 !important;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  font-family: inherit;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; 
}
:deep(.ql-editor) {
  flex: 1;
  overflow-y: auto; 
  padding: 1rem;
  padding-bottom: 2.5rem; 
}

:deep(.ql-tooltip) {
  z-index: 100 !important;
}

:deep(html.dark .ql-toolbar) {
  border-color: #27272a !important;
  background-color: #18181b;
}
:deep(html.dark #custom-toolbar) {
  border-bottom-color: #27272a !important;
}
:deep(html.dark .ql-toolbar .ql-stroke) { stroke: #a1a1aa; }
:deep(html.dark .ql-toolbar .ql-fill) { fill: #a1a1aa; }
:deep(html.dark .ql-picker-options) { background-color: #18181b !important; border-color: #27272a !important; color: #e4e4e7; }
:deep(html.dark .ql-container) { border-color: #27272a !important; color: #e4e4e7; }
</style>

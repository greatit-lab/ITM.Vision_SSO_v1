<!-- frontend/src/views/support/QnaWriteView.vue -->
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#09090b] p-6 lg:p-8 flex flex-col w-full">
    
    <div class="w-full flex-1">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ isEditMode ? '게시글 수정' : '질문 작성' }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ isEditMode ? '등록된 게시글의 내용을 수정합니다.' : '관리자에게 문의사항을 남기거나 시스템 이슈를 제보해 주세요.' }}
        </p>
      </div>

      <div v-if="isLoadingData" class="text-center py-20">
         <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
      </div>

      <div v-else class="bg-white dark:bg-zinc-900 rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200 dark:border-zinc-800">
        <form @submit.prevent="submitPost" class="space-y-6">
          
          <div class="grid gap-6 md:grid-cols-[1fr_200px]">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase">제목 (Subject)</label>
              <input 
                v-model="form.title"
                type="text" 
                required
                placeholder="제목을 입력하세요" 
                class="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white"
              >
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase">카테고리 (Category)</label>
              <select 
                v-model="form.category"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="QNA">Q&A (질문)</option>
                <option value="BUG">Bug Report (버그)</option>
                <option value="NOTICE" v-if="isAdmin">Notice (공지)</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase">내용 (Content)</label>
            <div class="editor-wrapper bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
              <QuillEditor 
                v-model:content="form.content" 
                contentType="html"
                theme="snow"
                toolbar="essential"
                placeholder="상세 내용을 작성해 주세요..."
                class="min-h-[400px] text-base"
              />
            </div>
            <p class="text-xs text-slate-400 text-right mt-1">* 캡처한 이미지를 Ctrl+V로 바로 붙여넣을 수 있습니다.</p>
          </div>

          <div class="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isSecret" 
                v-model="form.isSecret"
                true-value="Y"
                false-value="N"
                class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              >
              <label for="isSecret" class="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none flex items-center gap-1.5">
                <i class="pi pi-lock text-xs"></i> 비밀글
              </label>
            </div>

            <div class="flex gap-3">
              <button 
                type="button" 
                @click="$router.back()"
                class="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                취소
              </button>
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
                {{ isSubmitting ? '저장 중...' : (isEditMode ? '수정 완료' : '등록하기') }}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { boardApi } from '@/api/board';
import { QuillEditor } from '@vueup/vue-quill';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isSubmitting = ref(false);
const isLoadingData = ref(false);
const isEditMode = ref(false);
const targetId = ref(0);

const form = reactive({
  title: '',
  category: 'QNA',
  content: '',
  isSecret: 'N'
});

const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER');

onMounted(async () => {
  if (route.query.id) {
    isEditMode.value = true;
    targetId.value = Number(route.query.id);
    await loadPostData(targetId.value);
  }
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
</script>

<style>
.ql-toolbar {
  border-color: #e2e8f0 !important;
  background-color: #f8fafc;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}
.ql-container {
  border-color: #e2e8f0 !important;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  font-family: inherit;
}
.ql-editor {
  min-height: 400px;
}
html.dark .ql-toolbar {
  border-color: #27272a !important;
  background-color: #18181b;
}
html.dark .ql-toolbar .ql-stroke { stroke: #a1a1aa; }
html.dark .ql-toolbar .ql-fill { fill: #a1a1aa; }
html.dark .ql-container { border-color: #27272a !important; color: #e4e4e7; }
</style>

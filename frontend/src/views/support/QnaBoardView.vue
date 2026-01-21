<!-- frontend/src/views/support/QnaBoardView.vue -->
<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Q&A Board</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          문의사항을 남기거나 시스템 버그를 제보해 주세요.
        </p>
      </div>
      <button 
        @click="$router.push({ name: 'qna-write' })"
        class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
      >
        <i class="pi pi-pencil"></i> 질문 작성
      </button>
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-zinc-800 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
        <button 
          v-for="cat in categories" 
          :key="cat.value"
          @click="filter.category = cat.value; fetchPosts()"
          class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all"
          :class="filter.category === cat.value 
            ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="relative w-full md:w-64 group">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
        <input 
          v-model="filter.search"
          @keyup.enter="fetchPosts"
          type="text" 
          placeholder="키워드 검색..." 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
        >
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
    </div>

    <div v-else-if="posts.length === 0" class="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 border-dashed">
      <i class="pi pi-inbox text-4xl text-slate-300 mb-3"></i>
      <p class="text-slate-500">등록된 게시글이 없습니다.</p>
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="post in posts" 
        :key="post.postId"
        @click="goToDetail(post)"
        class="group bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer hover:shadow-md"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                :class="getCategoryColor(post.category)"
              >
                {{ post.category }}
              </span>
              <span v-if="post.isSecret === 'Y'" class="text-slate-400 flex items-center gap-1" title="비밀글">
                  <i class="pi pi-lock text-xs"></i>
              </span>
              <span class="text-xs text-slate-400">{{ formatDate(post.createdAt) }}</span>
            </div>
            <h3 class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
              {{ post.title }}
            </h3>
            <p class="text-xs text-slate-500">
              작성자: <span class="font-medium text-slate-700 dark:text-slate-300">{{ post.authorId }}</span>
            </p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <span 
              class="px-2.5 py-1 rounded-full text-[10px] font-bold border"
              :class="post.status === 'ANSWERED' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50' 
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700'"
            >
              {{ post.status === 'ANSWERED' ? '답변완료' : '답변대기' }}
            </span>
            <div class="flex items-center gap-1 text-xs text-slate-400">
              <i class="pi pi-comment"></i>
              <span>{{ post._count?.comments || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center mt-8 gap-2">
      <button 
        @click="changePage(page - 1)" 
        :disabled="page === 1"
        class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-slate-50"
      >
        <i class="pi pi-chevron-left text-xs"></i>
      </button>
      <span class="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
        페이지 {{ page }}
      </span>
      <button 
        @click="changePage(page + 1)" 
        class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50"
      >
        <i class="pi pi-chevron-right text-xs"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { boardApi, type BoardPost } from '@/api/board';

const router = useRouter();
const loading = ref(false);
const posts = ref<BoardPost[]>([]);
const page = ref(1);

const filter = reactive({
  category: 'ALL', // 기본값
  search: ''
});

// 공지사항(NOTICE)은 좌측에 있으므로 메인 필터에서는 제거
const categories = [
  { label: '전체', value: 'ALL' },
  { label: 'Q&A', value: 'QNA' },
  { label: '버그신고', value: 'BUG' },
  // { label: '공지사항', value: 'NOTICE' } -> 좌측 사이드바 전용
];

const fetchPosts = async () => {
  loading.value = true;
  try {
    const res = await boardApi.getPosts({
      page: page.value,
      limit: 10,
      category: filter.category,
      search: filter.search
    });
    posts.value = res.data.data || res.data; 
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const changePage = (newPage: number) => {
  if (newPage < 1) return;
  page.value = newPage;
  fetchPosts();
};

const goToDetail = (post: BoardPost) => {
  router.push({ name: 'qna-detail', params: { id: post.postId } });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'NOTICE': return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30';
    case 'BUG': return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30';
    default: return 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30';
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

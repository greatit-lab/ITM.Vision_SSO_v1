<!-- frontend/src/views/support/QnaBoardView.vue -->
<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col md:flex-row gap-3 justify-between items-center mb-4 shrink-0">
      <div class="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
        <button 
          v-for="cat in categories" 
          :key="cat.value"
          @click="filter.category = cat.value; first = 0; fetchPosts()"
          class="px-3 py-1.5 text-xs font-bold rounded-md transition-all"
          :class="filter.category === cat.value 
            ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative w-full md:w-64 group">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors text-xs"></i>
          <input 
            v-model="filter.search"
            @keyup.enter="() => { first = 0; fetchPosts(); }"
            type="text" 
            placeholder="검색어 입력..." 
            class="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 rounded-lg text-xs outline-none transition-all placeholder:text-slate-400"
          >
        </div>

        <button 
          @click="$router.push({ name: 'qna-write' })"
          class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 whitespace-nowrap h-[34px]"
        >
          <i class="pi pi-pencil"></i> 질문 작성
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-2.5 bg-white border-b border-slate-100 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
        <div class="flex items-center gap-2 pl-2">
          <div class="w-1 h-3 bg-indigo-500 rounded-full"></div>
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Post List</h3>
        </div>
        
        <div class="flex items-center gap-3 pr-2 text-xs text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-2">
            <span class="font-medium">Rows:</span>
            <select 
              v-model="rowsPerPage" 
              @change="onRowsChange" 
              class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
          <span class="font-medium min-w-[60px] text-right">
            {{ totalRecords === 0 ? 0 : first + 1 }} - {{ Math.min(first + rowsPerPage, totalRecords) }} / {{ totalRecords }}
          </span>
          <div class="flex items-center gap-1">
            <button @click="first = 0; fetchPosts()" :disabled="first === 0" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30">
              <i class="pi pi-angle-double-left text-[10px]"></i>
            </button>
            <button @click="prevPage" :disabled="first === 0" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30">
              <i class="pi pi-angle-left text-[10px]"></i>
            </button>
            <button @click="nextPage" :disabled="first + rowsPerPage >= totalRecords" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30">
              <i class="pi pi-angle-right text-[10px]"></i>
            </button>
            <button @click="lastPage" :disabled="first + rowsPerPage >= totalRecords" class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30">
              <i class="pi pi-angle-double-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
      </div>

      <div v-else class="flex-1 overflow-y-auto custom-scrollbar relative">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-zinc-700 sticky top-0 z-10 shadow-sm">
            <tr>
              <th class="px-3 py-2.5 text-center w-14">No</th>
              <th class="px-3 py-2.5 text-center w-20">분류</th>
              <th class="px-3 py-2.5">제목</th>
              <th class="px-3 py-2.5 text-center w-28">작성자</th>
              <th class="px-3 py-2.5 text-center w-28">작성일</th>
              <th class="px-3 py-2.5 text-center w-20">상태</th>
              <th class="px-3 py-2.5 text-center w-16">조회</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr v-if="posts.length === 0">
              <td colspan="7" class="px-4 py-20 text-center text-slate-500">
                등록된 게시글이 없습니다.
              </td>
            </tr>
            <tr 
              v-for="post in posts" 
              :key="post.postId"
              @click="goToDetail(post)"
              class="hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
            >
              <td class="px-3 py-2.5 text-center text-slate-400">{{ post.postId }}</td>
              <td class="px-3 py-2.5 text-center">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border" :class="getCategoryColor(post.category)">
                  {{ post.category }}
                </span>
              </td>
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <span v-if="post.isSecret === 'Y'" class="text-slate-400" title="비밀글"><i class="pi pi-lock text-[10px]"></i></span>
                  <span class="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[400px] block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ post.title }}</span>
                  
                  <div v-if="(post._count?.comments || 0) > 0" class="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-700 rounded text-[10px] text-slate-500 dark:text-slate-300 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <i class="pi pi-comment text-[9px]"></i>
                    <span>{{ post._count?.comments }}</span>
                  </div>
                </div>
              </td>
              <td class="px-3 py-2.5 text-center truncate max-w-[100px]" :class="getAuthorClass(post.user?.role)">
                {{ getAuthorName(post.authorId, post.user?.role) }}
              </td>
              <td class="px-3 py-2.5 text-center text-slate-500 text-[10px]">{{ formatDate(post.createdAt) }}</td>
              <td class="px-3 py-2.5 text-center">
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="post.status === 'ANSWERED' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                    : 'bg-slate-100 text-slate-500 dark:bg-zinc-700'"
                >
                  {{ post.status === 'ANSWERED' ? '완료' : '대기' }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-center text-slate-400 text-[10px]">{{ post.views }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { boardApi, type BoardPost } from '@/api/board';

const router = useRouter();
const loading = ref(false);
const posts = ref<any[]>([]); // 타입 유연성을 위해 any 사용 (user relation 포함)

const rowsPerPage = ref(15);
const totalRecords = ref(0);
const first = ref(0);

const filter = reactive({
  category: 'ALL',
  search: ''
});

const categories = [
  { label: '전체', value: 'ALL' },
  { label: 'Q&A', value: 'QNA' },
  { label: '버그신고', value: 'BUG' },
];

const fetchPosts = async () => {
  loading.value = true;
  try {
    const currentPage = Math.floor(first.value / rowsPerPage.value) + 1;
    const res = await boardApi.getPosts({
      page: currentPage,
      limit: rowsPerPage.value,
      category: filter.category,
      search: filter.search
    });

    if (res.data && res.data.data) {
      posts.value = res.data.data;
      if (res.data.meta) totalRecords.value = res.data.meta.total;
    } else {
      posts.value = Array.isArray(res.data) ? res.data : [];
      totalRecords.value = posts.value.length; 
    }
  } catch (e: any) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// [추가] 권한별 작성자 이름 표시 함수
const getAuthorName = (authorId: string, role?: string) => {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'MANAGER') return 'MANAGER';
  return authorId;
};

// [추가] 권한별 텍스트 스타일
const getAuthorClass = (role?: string) => {
  if (role === 'ADMIN' || role === 'MANAGER') {
    return 'text-indigo-600 dark:text-indigo-400 font-bold';
  }
  return 'text-slate-600 dark:text-slate-400';
};

const onRowsChange = () => {
  first.value = 0;
  fetchPosts();
};

const prevPage = () => {
  if (first.value > 0) {
    first.value -= rowsPerPage.value;
    fetchPosts();
  }
};

const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value) {
    first.value += rowsPerPage.value;
    fetchPosts();
  }
};

const lastPage = () => {
  first.value = Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) * rowsPerPage.value;
  fetchPosts();
};

const goToDetail = (post: BoardPost) => {
  router.push({ name: 'qna-detail', params: { id: post.postId } });
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

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

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }
</style>

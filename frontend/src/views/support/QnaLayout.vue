<!-- frontend/src/views/support/QnaLayout.vue -->
<template>
  <div class="w-full h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#09090b] p-4 lg:p-6 flex flex-col overflow-hidden">
    
    <div class="flex items-center gap-3 mb-6 shrink-0">
      <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400">
        <i class="pi pi-comments text-xl"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">Q&A Board</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          문의사항 및 요청사항을 확인하세요.
        </p>
      </div>
    </div>

    <div class="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      
      <aside class="flex flex-col gap-4 max-h-full overflow-hidden">
         <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col min-h-0 overflow-hidden shrink-0">
            <div class="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-800 shrink-0">
               <h3 class="font-bold text-white flex items-center gap-2 text-sm">
                 <i class="pi pi-megaphone"></i> 공지사항 (Notice)
               </h3>
            </div>
            
            <div class="divide-y divide-slate-100 dark:divide-zinc-800 overflow-y-auto custom-scrollbar max-h-[300px] lg:max-h-[calc(100vh-250px)]">
               <div v-if="loading" class="p-6 text-center text-slate-400 text-xs">
                 <i class="pi pi-spin pi-spinner"></i>
               </div>
               <div v-else-if="notices.length === 0" class="p-8 text-center text-xs text-slate-400">
                 등록된 공지가 없습니다.
               </div>
               
               <div 
                 v-for="notice in notices" 
                 :key="notice.postId"
                 @click="goToDetail(notice.postId)"
                 class="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
               >
                  <div class="flex items-start gap-2">
                     <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" v-if="isNew(notice.createdAt)"></span>
                     <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 flex-shrink-0" v-else></span>
                     <div>
                        <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug mb-0.5 line-clamp-2">
                           {{ notice.title }}
                        </h4>
                        <span class="text-[10px] text-slate-400 block">{{ formatDate(notice.createdAt) }}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div v-if="isAdmin" class="p-2 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 shrink-0">
               <button 
                @click="writeNotice" 
                class="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
               >
                  <i class="pi pi-plus"></i> 공지사항 등록
               </button>
            </div>
         </div>

         <div class="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shrink-0">
            <h4 class="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">도움이 필요하신가요?</h4>
            <p class="text-[11px] text-indigo-600/80 dark:text-indigo-400/70 leading-relaxed">
              서비스 사용 중 발생된 버그 제보는<br />'Bug Report' 카테고리를 이용해 주세요.
            </p>
         </div>
      </aside>

      <main class="h-full min-w-0 overflow-hidden flex flex-col relative">
         <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
               <component :is="Component" />
            </transition>
         </router-view>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { boardApi, type BoardPost } from '@/api/board';
import dayjs from 'dayjs'; // [추가]

const router = useRouter();
const authStore = useAuthStore();
const notices = ref<BoardPost[]>([]);
const loading = ref(true);

const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER');

const fetchNotices = async () => {
  loading.value = true;
  try {
    const res = await boardApi.getPosts({ page: 1, limit: 5, category: 'NOTICE' });
    notices.value = res.data.data || res.data;
  } catch (e) {
    console.error("Failed to load notices", e);
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id: number) => {
  router.push({ name: 'qna-detail', params: { id } });
};

const writeNotice = () => {
  router.push({ name: 'qna-write', query: { category: 'NOTICE' } });
};

// [수정] 날짜 포맷 통일 (YYYY-MM-DD)
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = dayjs(dateStr);
  return date.isValid() ? date.format('YYYY-MM-DD') : '-';
};

const isNew = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  return diff < 1000 * 60 * 60 * 24 * 3; // 3일 이내
};

onMounted(() => {
  fetchNotices();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }
</style>

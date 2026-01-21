<!-- frontend/src/views/support/QnaLayout.vue -->
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#09090b] p-4 lg:p-8">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
      
      <aside class="space-y-6 lg:sticky lg:top-24">
         <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div class="p-5 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-800">
               <h3 class="font-bold text-white flex items-center gap-2 text-sm">
                 <i class="pi pi-megaphone"></i> 공지사항 (Notice)
               </h3>
               <p class="text-indigo-100 text-[11px] mt-1 opacity-80 font-light">
                 시스템 주요 소식을 확인하세요.
               </p>
            </div>
            
            <div class="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
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
                 class="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
               >
                  <div class="flex items-start gap-3">
                     <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" v-if="isNew(notice.createdAt)"></span>
                     <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 flex-shrink-0" v-else></span>
                     <div>
                        <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug mb-1 line-clamp-2">
                           {{ notice.title }}
                        </h4>
                        <span class="text-[10px] text-slate-400 block">{{ formatDate(notice.createdAt) }}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div v-if="isAdmin" class="p-3 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800">
               <button 
                @click="writeNotice" 
                class="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
               >
                  <i class="pi pi-plus"></i> 공지사항 등록
               </button>
            </div>
         </div>

         <div class="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <h4 class="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">도움이 필요하신가요?</h4>
            <p class="text-[11px] text-indigo-600/80 dark:text-indigo-400/70 leading-relaxed">
              버그 제보는 'Bug Report' 카테고리를 이용해 주시면 빠르게 처리됩니다.
            </p>
         </div>
      </aside>

      <main class="min-w-0">
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

const router = useRouter();
const authStore = useAuthStore();
const notices = ref<BoardPost[]>([]);
const loading = ref(true);

const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER');

const fetchNotices = async () => {
  loading.value = true;
  try {
    // NOTICE 카테고리만 5개 조회
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
  // 글쓰기 페이지로 이동 (Category=NOTICE 쿼리 파라미터 전달 가능)
  router.push({ name: 'qna-write', query: { category: 'NOTICE' } });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
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
</style>

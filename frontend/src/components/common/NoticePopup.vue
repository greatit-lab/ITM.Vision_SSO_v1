<!-- frontend/src/components/common/NoticePopup.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
    <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
      
      <div class="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
        <h3 class="font-bold text-sm flex items-center gap-2">
          <i class="pi pi-megaphone"></i> 공지사항
        </h3>
        <button @click="closePopup" class="text-white/80 hover:text-white transition-colors">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ notice.title }}</h2>
        <p class="text-xs text-slate-400 mb-4">{{ formatDate(notice.createdAt) }}</p>
        <div class="prose dark:prose-invert text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed" v-html="notice.content"></div>
      </div>

      <div class="p-3 bg-slate-50 dark:bg-zinc-800 border-t border-slate-100 dark:border-zinc-700 shrink-0 flex flex-col gap-2">
        <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
          <label class="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
            <input type="checkbox" v-model="hideToday" @change="hideWeek = false" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
            오늘 하루 그만보기
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
            <input type="checkbox" v-model="hideWeek" @change="hideToday = false" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
            일주일간 그만보기
          </label>
        </div>
        <button 
          @click="handleClose" 
          class="w-full py-2 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs'; // [추가]

const props = defineProps<{
  notice: any
}>();

const emit = defineEmits(['close']);
const visible = ref(true);
const hideToday = ref(false);
const hideWeek = ref(false);

// [수정] 날짜 포맷 통일 (YYYY-MM-DD)
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = dayjs(dateStr);
  return date.isValid() ? date.format('YYYY-MM-DD') : '-';
};

const closePopup = () => {
  visible.value = false;
  emit('close');
};

const handleClose = () => {
  const storageKey = `notice_hide_${props.notice.postId}`;
  
  if (hideToday.value) {
    // 오늘 자정까지
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    localStorage.setItem(storageKey, tomorrow.toISOString());
  } else if (hideWeek.value) {
    // 7일 후까지
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    localStorage.setItem(storageKey, nextWeek.toISOString());
  }

  closePopup();
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
</style>

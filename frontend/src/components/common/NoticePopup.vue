<!-- frontend/src/components/common/NoticePopup.vue -->
<template>
  <div v-if="visibleNotices.length > 0" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
    <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-fit min-w-[400px] max-w-[90vw] overflow-hidden flex flex-col max-h-[80vh] relative">
      
      <div class="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
        <h3 class="font-bold text-sm flex items-center gap-2">
          <i class="pi pi-megaphone"></i> 공지사항
          <span v-if="visibleNotices.length > 1" class="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px] tracking-widest font-mono shadow-inner">
            {{ currentIndex + 1 }} / {{ visibleNotices.length }}
          </span>
        </h3>
        <button @click="closeAll" class="text-white/80 hover:text-white transition-colors" title="모두 닫기">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="flex-1 relative min-h-[250px] flex flex-col bg-white dark:bg-zinc-900">
        <button 
          v-if="visibleNotices.length > 1" 
          @click="prev" 
          class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-slate-500 transition-colors z-10 shadow-sm"
        >
          <i class="pi pi-chevron-left text-xs"></i>
        </button>
        <button 
          v-if="visibleNotices.length > 1" 
          @click="next" 
          class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-slate-500 transition-colors z-10 shadow-sm"
        >
          <i class="pi pi-chevron-right text-xs"></i>
        </button>

        <div class="overflow-y-auto custom-scrollbar flex-1 p-6" :class="{'px-12': visibleNotices.length > 1}">
          
          <div class="flex justify-between items-baseline gap-4 mb-4 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white break-keep">{{ currentNotice.title }}</h2>
            <p class="text-xs text-slate-400 shrink-0">{{ formatDate(currentNotice.createdAt) }}</p>
          </div>
          
          <div 
            ref="contentRef"
            class="prose dark:prose-invert text-base text-slate-800 dark:text-slate-300 whitespace-pre-line leading-relaxed w-full max-w-none" 
            v-html="currentNotice.content">
          </div>
        </div>
      </div>

      <div class="p-3 bg-slate-50 dark:bg-zinc-800 border-t border-slate-100 dark:border-zinc-700 shrink-0 flex flex-col gap-3">
        <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 px-1">
          <label class="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors group">
            <input type="checkbox" v-model="hideToday" @change="hideWeek = false" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
            <span class="group-hover:font-bold">이 공지 오늘 하루 그만보기</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors group">
            <input type="checkbox" v-model="hideWeek" @change="hideToday = false" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
            <span class="group-hover:font-bold">일주일간 그만보기</span>
          </label>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="handleCloseCurrent" 
            class="flex-1 py-2.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            {{ visibleNotices.length > 1 ? '현재 공지 닫기' : '닫기' }}
          </button>
          
          <button 
            v-if="visibleNotices.length > 1"
            @click="closeAll" 
            class="flex-1 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            모두 닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'; 
import dayjs from 'dayjs';

const props = defineProps<{
  notices: any[]
}>();

const emit = defineEmits(['close']);

const visibleNotices = ref<any[]>([]);
const currentIndex = ref(0);
const contentRef = ref<HTMLElement | null>(null); 

const hideToday = ref(false);
const hideWeek = ref(false);

const currentNotice = computed(() => visibleNotices.value[currentIndex.value] || {});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = dayjs(dateStr);
  return date.isValid() ? date.format('YYYY-MM-DD') : '-';
};

const processLinks = async () => {
  await nextTick(); 
  if (!contentRef.value) return;
  
  const links = contentRef.value.querySelectorAll('a');
  links.forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
      link.setAttribute('href', `https://${href}`);
    }
  });
};

watch(currentNotice, () => {
  processLinks();
}, { immediate: true });

onMounted(() => {
  if (props.notices && props.notices.length > 0) {
    visibleNotices.value = props.notices.filter(notice => {
      const hideUntil = localStorage.getItem(`notice_hide_${notice.postId}`);
      if (hideUntil) {
        if (new Date(hideUntil) > new Date()) return false; 
        localStorage.removeItem(`notice_hide_${notice.postId}`); 
      }
      return true;
    });
  }

  if (visibleNotices.value.length === 0) {
    emit('close');
  }
});

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % visibleNotices.value.length;
  resetCheckboxes();
};

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + visibleNotices.value.length) % visibleNotices.value.length;
  resetCheckboxes();
};

const resetCheckboxes = () => {
  hideToday.value = false;
  hideWeek.value = false;
};

const saveHideSetting = (noticeId: number) => {
  const storageKey = `notice_hide_${noticeId}`;
  if (hideToday.value) {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0); 
    localStorage.setItem(storageKey, tomorrow.toISOString());
  } else if (hideWeek.value) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7); 
    localStorage.setItem(storageKey, nextWeek.toISOString());
  }
};

const handleCloseCurrent = () => {
  saveHideSetting(currentNotice.value.postId);
  
  visibleNotices.value.splice(currentIndex.value, 1);

  if (visibleNotices.value.length === 0) {
    emit('close');
  } else {
    if (currentIndex.value >= visibleNotices.value.length) {
      currentIndex.value = visibleNotices.value.length - 1;
    }
    resetCheckboxes();
  }
};

const closeAll = () => {
  if (hideToday.value || hideWeek.value) {
    saveHideSetting(currentNotice.value.postId);
  }
  visibleNotices.value = [];
  emit('close');
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }

.prose :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
}

:deep(.prose a) {
  color: #4f46e5;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: color 0.2s;
}

:deep(.prose a:hover) {
  color: #4338ca;
}

.dark :deep(.prose a) {
  color: #818cf8;
}

.dark :deep(.prose a:hover) {
  color: #a5b4fc;
}

:deep(.prose h1) { font-size: 1.875rem !important; font-weight: bold; margin-bottom: 1rem; margin-top: 1.5rem; line-height: 1.2;}
:deep(.prose h2) { font-size: 1.5rem !important; font-weight: bold; margin-bottom: 0.875rem; margin-top: 1.25rem; line-height: 1.3;}
:deep(.prose h3) { font-size: 1.25rem !important; font-weight: bold; margin-bottom: 0.75rem; margin-top: 1rem; line-height: 1.4;}
</style>

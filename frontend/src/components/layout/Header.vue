<!-- frontend/src/components/layout/Header.vue -->
<template>
  <header
    class="h-12 flex items-center justify-end px-6 bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors duration-500 z-40 sticky top-0"
  >
    <div class="flex items-center gap-3">
      <button
        @click="toggleDarkMode"
        class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none border-2 border-slate-200 dark:border-zinc-700"
        :class="isDark ? 'bg-zinc-800' : 'bg-slate-100'"
      >
        <div class="w-full flex justify-between px-2 z-0">
          <i class="pi pi-sun text-[9px] text-slate-400 dark:text-zinc-500"></i>
          <i class="pi pi-moon text-[9px] text-slate-400 dark:text-zinc-500"></i>
        </div>
        <div
          class="absolute top-0.5 w-6 h-6 bg-white dark:bg-zinc-600 rounded-full shadow-sm transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center z-10 border border-slate-100 dark:border-zinc-500"
          :class="isDark ? 'translate-x-[26px]' : 'translate-x-0.5'"
        >
          <i
            class="pi text-[9px]"
            :class="isDark ? 'pi-moon text-white' : 'pi-sun text-amber-500'"
          ></i>
        </div>
      </button>

      <div class="h-6 w-px bg-slate-200 dark:bg-zinc-700 mx-2"></div>

      <button
        class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors relative"
      >
        <i class="pi pi-bell text-lg"></i>
        <span
          class="absolute top-1 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-[#09090B]"
        ></span>
      </button>

      <button
        class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <i class="pi pi-cog text-lg"></i>
      </button>

      <div class="relative" ref="menuRef">
        <button 
          @click="toggleMenu"
          v-tooltip.bottom="authStore.userDetailTooltip"
          class="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
        >
          <div class="text-right hidden sm:block">
            <p
              class="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight truncate max-w-[120px]"
            >
              {{ authStore.userName }}
            </p>
          </div>

          <div
            class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-zinc-800 text-xs shrink-0"
          >
            {{ authStore.userInitial }}
          </div>
          <i 
            class="pi pi-chevron-down text-[10px] text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': isMenuOpen }"
          ></i>
        </button>

        <transition name="scale-in">
          <div 
            v-if="isMenuOpen"
            class="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-50 origin-top-right"
          >
            <a href="#" class="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
              <i class="pi pi-user text-indigo-500"></i> Profile Settings
            </a>
            
            <div class="border-t border-slate-100 dark:border-zinc-800 my-1"></div>
            
            <button 
              @click="authStore.logout"
              class="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-left"
            >
              <i class="pi pi-sign-out"></i> Sign Out
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// 다크모드 상태 관리
const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  }
};

// 메뉴 토글 함수
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  // 다크모드 초기화
  isDark.value =
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark.value) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");

  // 이벤트 리스너 등록
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.scale-in-enter-active, .scale-in-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.scale-in-enter-from, .scale-in-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
</style>

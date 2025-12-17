<!-- frontend/src/components/layout/Sidebar.vue -->
<template>
  <aside
    class="flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-r shadow-xl bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-gray-200 dark:border-white/10"
    :class="isOpen ? 'w-60' : 'w-[70px]'"
  >
    <div
      class="relative flex items-center h-16 transition-all duration-300 border-b border-slate-100 dark:border-slate-800/50"
      :class="isOpen ? 'px-5 justify-start' : 'px-0 justify-center'"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="flex items-center justify-center flex-shrink-0 w-11 h-11">
          <img
            :src="logoUrl"
            alt="ITM Vision Logo"
            class="object-contain w-full h-full transition-all duration-300 drop-shadow-md filter hover:scale-110"
          />
        </div>

        <div
          class="flex flex-col transition-opacity duration-300"
          :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'"
        >
          <span
            class="text-base font-extrabold leading-none tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap"
          >
            ITM Vision
          </span>
          <span
            class="text-[10px] scale-[0.9] origin-left text-indigo-500 dark:text-indigo-400 font-bold tracking-widest uppercase whitespace-nowrap mt-0.5"
          >
            Smart Factory
          </span>
        </div>
      </div>

      <button
        @click="toggleSidebar"
        class="absolute z-50 flex items-center justify-center w-5 h-5 transition-all duration-200 transform -translate-y-1/2 bg-white border rounded-full shadow-sm cursor-pointer -right-3 top-1/2 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:scale-110 hover:border-indigo-200 dark:hover:border-indigo-500/50"
        :title="isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
      >
        <i
          class="pi text-[8px]"
          :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"
        ></i>
      </button>
    </div>

    <nav class="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
      <div v-if="menuStore.isLoading" class="flex justify-center py-10">
        <i class="text-xl text-indigo-500 pi pi-spin pi-spinner"></i>
      </div>

      <ul v-else class="space-y-1">
        <SidebarItem
          v-for="menu in menuStore.menus"
          :key="menu.menuId"
          :item="menu"
          :is-sidebar-open="isOpen"
        />
      </ul>
    </nav>

    <div
      class="p-3 transition-all duration-300 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm"
      :class="isOpen ? '' : 'flex justify-center px-0'"
    >
      <div
        class="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md group"
        :class="isOpen ? 'w-full' : 'justify-center w-auto'"
      >
        <div
          class="relative flex items-center justify-center w-8 h-8 text-xs font-bold text-white transition-all duration-300 rounded-full shrink-0"
          :class="roleAvatarClass"
          :title="mockRole"
        >
          {{ roleInitial }}

          <span
            v-if="mockRole === 'Admin'"
            class="absolute inset-0 rounded-full animate-ping opacity-20 bg-rose-500"
          ></span>
        </div>

        <div
          class="flex flex-col justify-center flex-1 min-w-0 overflow-hidden transition-all duration-300"
          :class="isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'"
        >
          <p
            class="text-sm font-extrabold leading-tight truncate text-slate-700 dark:text-slate-200"
            :title="mockSiteInfo"
          >
            {{ mockSiteInfo }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import logoUrl from "@/assets/ITM_Vision.png";
import SidebarItem from "./SidebarItem.vue"; // [추가] 동적 메뉴 아이템 컴포넌트
import { useMenuStore } from "@/stores/menu"; // [추가] 메뉴 스토어

const menuStore = useMenuStore();
const isOpen = ref(true);

// --- 목업 데이터 (Mock Data) - Auth Store 연동 전 유지 ---
const mockRole = ref("Admin");
const mockSiteInfo = ref("P3-Ph2 / SDWT-Gr1");

// 권한 이니셜 추출 (A, M, U)
const roleInitial = computed(() => mockRole.value.charAt(0).toUpperCase());

// [디자인 로직] 권한에 따른 Border & Glow 스타일 클래스 정의
const roleAvatarClass = computed(() => {
  switch (mockRole.value) {
    case "Admin":
      return [
        "bg-rose-500",
        "shadow-[0_0_12px_rgba(244,63,94,0.6)]",
        "ring-2 ring-white dark:ring-zinc-800",
        "border border-rose-400",
      ];
    case "Manager":
      return [
        "bg-amber-500",
        "ring-2 ring-amber-300/80 dark:ring-amber-600",
        "ring-offset-1 ring-offset-white dark:ring-offset-zinc-900",
        "shadow-md",
      ];
    default:
      return [
        "bg-slate-500",
        "border border-slate-300 dark:border-slate-600",
        "shadow-sm",
      ];
  }
});

// 사이드바 토글 함수
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", { detail: isOpen.value })
  );
};

// [추가] 컴포넌트 마운트 시 동적 메뉴 로드
onMounted(async () => {
  if (menuStore.menus.length === 0) {
    await menuStore.loadMenus();
  }
});
</script>

<style scoped>
/* 스크롤바 숨기기 (표준 CSS) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

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
      <div class="flex items-center gap-3 overflow-hidden" @click="$router.push('/')">
        <div class="relative group cursor-pointer">
          <div class="absolute transition-opacity duration-500 rounded-full opacity-0 -inset-2 blur-lg group-hover:opacity-100"></div>
          <img
            :src="logoUrl"
            alt="Logo"
            class="object-contain w-auto transition-all duration-300 h-8 drop-shadow-md filter hover:scale-110"
          />
        </div>

        <div
          class="flex flex-col transition-all duration-300 origin-left cursor-pointer"
          :class="isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0 hidden'"
        >
          <span class="font-sans text-lg font-black leading-none tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">
            ITM Vision
          </span>
          <span class="text-[6px] font-bold tracking-[0.25em] text-indigo-500 uppercase mt-1 whitespace-nowrap">
            Smart Factory
          </span>
        </div>
      </div>

      <button
        @click="toggleSidebar"
        class="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-7 h-7 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-full shadow-lg text-slate-400 hover:text-indigo-600 transition-all duration-300 hover:scale-110 focus:outline-none group"
      >
        <i class="pi text-[10px] transition-transform duration-300 group-hover:text-indigo-500"
           :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
      </button>
    </div>

    <nav class="flex-1 px-2 py-2 space-y-6 overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div v-if="menuStore.isLoading" class="flex justify-center py-10">
        <i class="text-2xl text-indigo-500 pi pi-spin pi-spinner-dotted"></i>
      </div>
      <ul v-else class="space-y-1">
        <SidebarItem
          v-for="menu in visibleMenus"
          :key="menu.menuId"
          :item="menu"
          :is-sidebar-open="isOpen"
        />
      </ul>
    </nav>

    <div
      class="p-4 mt-auto transition-all duration-300 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm"
      :class="isOpen ? '' : 'flex justify-center px-0'"
    >
      <div
        class="flex items-center gap-3.5 p-2.5 rounded-xl transition-all duration-300 cursor-pointer group hover:bg-white dark:hover:bg-white/10 hover:shadow-md border border-transparent hover:border-slate-100 dark:hover:border-white/5"
        :class="isOpen ? 'w-full' : 'justify-center w-auto aspect-square'"
      >
        <div
          class="relative flex items-center justify-center text-base font-bold text-white transition-transform duration-300 shadow-lg w-9 h-9 rounded-xl shrink-0 group-hover:scale-105 group-hover:rotate-3"
          :class="roleAvatarClass"
        >
          <span v-if="userRole === 'ADMIN'"
                class="absolute -inset-1.5 rounded-xl bg-rose-500/40 blur-md animate-pulse"></span>
          <span class="relative z-10 drop-shadow-sm">{{ roleInitial }}</span>
        </div>

        <div
          class="flex flex-col min-w-0 overflow-hidden transition-all duration-300"
          :class="isOpen ? 'opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 hidden'"
        >
          <p class="text-xs font-bold leading-tight truncate transition-colors text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {{ contextInfo || authStore.userName }}
          </p>
          <p class="text-[10px] font-bold truncate mt-0.5" :class="getRoleTextColor(userRole)">
            {{ userRole }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import logoUrl from "@/assets/ITM_Vision.png";
import SidebarItem from "./SidebarItem.vue";
import { useMenuStore } from "@/stores/menu";
import { useAuthStore } from "@/stores/auth";
import type { MenuNode } from "@/api/menu";

const menuStore = useMenuStore();
const authStore = useAuthStore();
const isOpen = ref(true);

const userRole = computed(() => authStore.user?.role || "USER");

const roleInitial = computed(() => {
  const role = userRole.value.toUpperCase();
  if (role === 'ADMIN') return 'A';
  if (role === 'MANAGER') return 'M';
  if (role === 'GUEST') return 'G';
  return 'U';
});

const hasContext = computed(() => !!authStore.user?.site && !!authStore.user?.sdwt);

const contextInfo = computed(() => {
  if (hasContext.value) return `${authStore.user?.site} / ${authStore.user?.sdwt}`;
  return "";
});

const roleAvatarClass = computed(() => {
  const r = userRole.value.toUpperCase();
  if (r === 'ADMIN') return 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/30';
  if (r === 'MANAGER') return 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30';
  if (r === 'USER') return 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30';
  if (r === 'GUEST') return 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30';
  return 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-500/30';
});

const getRoleTextColor = (role?: string) => {
  const r = role?.toUpperCase();
  if (r === 'ADMIN') return 'text-rose-500 dark:text-rose-400';
  if (r === 'MANAGER') return 'text-indigo-500 dark:text-indigo-400';
  if (r === 'USER') return 'text-emerald-500 dark:text-emerald-400';
  return 'text-slate-500';
};

const flattenMenus = (nodes: MenuNode[]): MenuNode[] => {
  let result: MenuNode[] = [];
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenMenus(node.children));
    } else {
      result.push(node);
    }
  }
  return result;
};

// 사이드바가 닫혔을 때는 계층 구조 없이 플랫하게 아이콘만 보여줌
const visibleMenus = computed(() => {
  if (isOpen.value) return menuStore.menus;
  return flattenMenus(menuStore.menus);
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: isOpen.value }));
};

onMounted(async () => {
  if (authStore.isAuthenticated && menuStore.menus.length === 0) {
    await menuStore.loadMenus();
  }
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<!-- frontend/src/components/layout/Sidebar.vue -->
<template>
  <aside
    class="flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-r shadow-xl bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-gray-200 dark:border-white/10"
    :class="isOpen ? 'w-60' : 'w-[70px]'"
  >
    <div
      class="h-16 flex items-center relative transition-all duration-300 border-b border-slate-100 dark:border-slate-800/50"
      :class="isOpen ? 'px-5 justify-start' : 'px-0 justify-center'"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="w-11 h-11 flex-shrink-0 flex items-center justify-center">
           <img 
             :src="logoUrl" 
             alt="ITM Vision Logo" 
             class="w-full h-full object-contain drop-shadow-md filter transition-all duration-300 hover:scale-110" 
           />
        </div>

        <div
          class="flex flex-col transition-opacity duration-300"
          :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'"
        >
          <span
            class="text-base font-extrabold tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap leading-none"
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
        class="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm z-50 transform hover:scale-110 hover:border-indigo-200 dark:hover:border-indigo-500/50 cursor-pointer"
        :title="isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
      >
        <i
          class="pi text-[8px]"
          :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"
        ></i>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-2 px-3 scrollbar-hide">
      <div class="mb-3">
        <div
          class="mb-1 px-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
          :class="{ 'opacity-0 h-0 overflow-hidden': !isOpen }"
        >
          Main
        </div>
        <router-link
          to="/"
          class="flex items-center py-2 rounded-lg text-sm font-bold transition-all duration-200 ease-out text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 overflow-hidden select-none cursor-pointer"
          :class="isOpen ? 'pl-6 pr-3' : 'justify-center px-0'"
          active-class="bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300"
          :title="!isOpen ? 'Overview' : ''"
        >
          <i class="pi pi-objects-column text-[17px] flex-shrink-0"></i>
          <span
            class="whitespace-nowrap transition-all duration-300"
            :class="
              isOpen
                ? 'opacity-100 ml-2.5 w-auto translate-x-0'
                : 'opacity-0 w-0 ml-0 -translate-x-2.5'
            "
          >
            Overview
          </span>
        </router-link>
      </div>

      <div v-for="group in menuGroups" :key="group.id" class="mb-1">
        <button
          @click="toggleGroup(group.id)"
          class="w-full flex items-center justify-between px-2 py-1 mb-0.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          :class="{ hidden: !isOpen }"
        >
          <span>{{ group.label }}</span>
          <i
            class="pi pi-chevron-down text-[9px] transition-transform duration-300"
            :class="openGroups[group.id] ? 'rotate-180' : ''"
          ></i>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out space-y-0.5"
          :class="
            openGroups[group.id] ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
          "
        >
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center py-2 rounded-lg text-sm font-bold transition-all duration-200 ease-out text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 overflow-hidden select-none cursor-pointer"
            :class="isOpen ? 'pl-6 pr-3' : 'justify-center px-0'"
            active-class="bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300"
            :title="!isOpen ? item.label : ''"
          >
            <i :class="[item.icon, 'text-[17px] flex-shrink-0']"></i>
            <span
              class="whitespace-nowrap transition-all duration-300"
              :class="
                isOpen
                  ? 'opacity-100 ml-2.5 w-auto translate-x-0'
                  : 'opacity-0 w-0 ml-0 -translate-x-2.5'
              "
            >
              {{ item.label }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <div
      class="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
      :class="isOpen ? '' : 'flex justify-center px-0'" 
    >
      <div
        class="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md group"
        :class="isOpen ? 'w-full' : 'justify-center w-auto'"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 text-xs shrink-0 relative"
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
          class="overflow-hidden transition-all duration-300 flex-1 min-w-0 flex flex-col justify-center"
          :class="isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'"
        >
          <p
            class="text-sm font-extrabold text-slate-700 dark:text-slate-200 truncate leading-tight"
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
import { ref, reactive, computed } from "vue";
// import { useAuthStore } from "@/stores/auth"; // [수정] 실제 데이터 연동 시 주석 해제하세요
import logoUrl from "@/assets/ITM_Vision.png";

// const authStore = useAuthStore(); // [수정] 현재 목업 사용으로 미사용 처리
const isOpen = ref(true);

// --- 목업 데이터 (Mock Data) ---
const mockRole = ref("Admin"); 
const mockSiteInfo = ref("P3-Ph2 / SDWT-Gr1");

// 권한 이니셜 추출 (A, M, U)
const roleInitial = computed(() => mockRole.value.charAt(0).toUpperCase());

// [디자인 로직] 권한에 따른 Border & Glow 스타일 클래스 정의
const roleAvatarClass = computed(() => {
  switch (mockRole.value) {
    case 'Admin': 
      return [
        'bg-rose-500', 
        'shadow-[0_0_12px_rgba(244,63,94,0.6)]', 
        'ring-2 ring-white dark:ring-zinc-800',  
        'border border-rose-400'
      ];
    case 'Manager': 
      return [
        'bg-amber-500', 
        'ring-2 ring-amber-300/80 dark:ring-amber-600', 
        'ring-offset-1 ring-offset-white dark:ring-offset-zinc-900', 
        'shadow-md'
      ];
    default: 
      return [
        'bg-slate-500', 
        'border border-slate-300 dark:border-slate-600',
        'shadow-sm'
      ];
  }
});

const menuGroups = [
  {
    id: "wafer",
    label: "Wafer Metrology",
    items: [
      {
        to: "/waferflatdata",
        label: "Wafer Flat Data",
        icon: "pi pi-chart-pie",
      },
      {
        to: "/lot-uniformity-trend",
        label: "Lot Uniformity",
        icon: "pi pi-chart-line",
      },
      {
        to: "/spectrum-analytics",
        label: "Spectrum Analysis",
        icon: "pi pi-wave-pulse",
      },
      {
        to: "/process-matching",
        label: "Process Matching",
        icon: "pi pi-clone",
      },
    ],
  },
  {
    id: "itm",
    label: "ITM Monitoring",
    items: [
      {
        to: "/equipment-explorer",
        label: "ITM Equip Specs",
        icon: "pi pi-desktop",
      },
      {
        to: "/performance-trend",
        label: "Performance",
        icon: "pi pi-bolt",
      },
      {
        to: "/process-memory",
        label: "Process Memory",
        icon: "pi pi-microchip",
      },
      {
        to: "/lamp-life",
        label: "Lamp Lifetime",
        icon: "pi pi-sun",
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced Analytics",
    items: [
      {
        to: "/prealign-analytics",
        label: "PreAlign Data",
        icon: "pi pi-compass",
      },
      {
        to: "/error-analytics",
        label: "Alert History",
        icon: "pi pi-bell",
      },
      {
        to: "/health",
        label: "Equipment Health",
        icon: "pi pi-heart-pulse",
      },
    ],
  },
];

const openGroups = reactive<Record<string, boolean>>({
  wafer: true,
  itm: true,
  advanced: true,
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", { detail: isOpen.value })
  );
};

const toggleGroup = (group: string) => {
  if (isOpen.value) {
    openGroups[group] = !openGroups[group];
  } else {
    isOpen.value = true;
    setTimeout(() => {
      openGroups[group] = true;
    }, 100);
  }
};
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

<!-- frontend/src/components/layout/SidebarItem.vue -->
<template>
  <li class="relative">
    <div v-if="hasChildren">
      <button
        @click="toggle"
        class="flex items-center w-full py-2 text-sm font-bold transition-all duration-200 ease-out rounded-lg cursor-pointer select-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
        :class="isSidebarOpen ? 'pl-6 pr-3' : 'justify-center px-0'"
        :title="!isSidebarOpen ? item.label : ''"
      >
        <i
          v-if="item.icon"
          :class="[item.icon, 'text-[17px] flex-shrink-0']"
        ></i>

        <span
          class="flex-1 text-left transition-all duration-300 whitespace-nowrap"
          :class="
            isSidebarOpen
              ? 'opacity-100 ml-2.5 w-auto translate-x-0'
              : 'opacity-0 w-0 ml-0 -translate-x-2.5 overflow-hidden'
          "
        >
          {{ item.label }}
        </span>

        <i
          v-if="isSidebarOpen"
          class="pi pi-chevron-down text-[9px] transition-transform duration-300 ml-auto"
          :class="{ 'rotate-180': isOpen }"
        ></i>
      </button>

      <transition
        enter-active-class="overflow-hidden transition-all duration-300 ease-in-out"
        leave-active-class="overflow-hidden transition-all duration-300 ease-in-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="max-h-[500px] opacity-100"
        leave-from-class="max-h-[500px] opacity-100"
        leave-to-class="opacity-0 max-h-0"
      >
        <ul v-if="isOpen && isSidebarOpen" class="mt-0.5 space-y-0.5">
          <SidebarItem
            v-for="child in item.children"
            :key="child.menuId"
            :item="child"
            :is-sidebar-open="isSidebarOpen"
            :depth="depth + 1"
          />
        </ul>
      </transition>
    </div>

    <router-link
      v-else
      :to="item.routerPath || '#'"
      class="flex items-center py-2 overflow-hidden text-sm font-bold transition-all duration-200 ease-out rounded-lg cursor-pointer select-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
      :class="isSidebarOpen ? 'pl-6 pr-3' : 'justify-center px-0'"
      active-class="text-indigo-600 shadow-sm bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
      :title="!isSidebarOpen ? item.label : ''"
    >
      <i :class="[item.icon, 'text-[17px] flex-shrink-0']"></i>

      <span
        class="transition-all duration-300 whitespace-nowrap"
        :class="
          isSidebarOpen
            ? 'opacity-100 ml-2.5 w-auto translate-x-0'
            : 'opacity-0 w-0 ml-0 -translate-x-2.5'
        "
      >
        {{ item.label }}
      </span>

      <span
        v-if="isSidebarOpen && item.statusTag === 'NEW'"
        class="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold text-red-600 bg-red-100 rounded-full"
        >N</span
      >
      <span
        v-if="isSidebarOpen && item.statusTag === 'BETA'"
        class="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold text-amber-600 bg-amber-100 rounded-full"
        >B</span
      >
    </router-link>
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { MenuNode } from "@/api/menu";
import { useRoute } from "vue-router";

const props = defineProps<{
  item: MenuNode;
  depth?: number;
  isSidebarOpen: boolean; // [중요] 부모로부터 사이드바 상태를 전달받음
}>();

const route = useRoute();
const depth = props.depth || 0;

// 자식 노드 존재 여부
const hasChildren = computed(
  () => props.item.children && props.item.children.length > 0
);

// 그룹 토글 상태
const isOpen = ref(true); // 기본적으로 펼쳐둠 (원하는 대로 조정 가능)

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

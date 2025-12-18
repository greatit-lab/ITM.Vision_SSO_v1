<!-- frontend/src/components/layout/SidebarItem.vue -->
<template>
  <li class="relative group/item">
    <div
      @click="handleClick"
      class="relative flex items-center min-h-[40px] my-0.5 rounded-lg cursor-pointer transition-all duration-200 select-none group/link"
      :class="[
        // 활성화(Active) 상태 디자인
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200',
        
        // 사이드바 열림/닫힘에 따른 패딩 및 정렬 처리
        isSidebarOpen ? 'justify-between px-3 mx-1' : 'justify-center px-0 mx-0',
      ]"
    >
      <div
        v-if="isActive"
        class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-md transition-all duration-300"
        :class="isSidebarOpen ? 'opacity-100' : 'opacity-0'"
      ></div>

      <div class="flex items-center min-w-0 gap-3">
        <div class="relative flex items-center justify-center w-5 h-5 shrink-0">
          <i
            v-if="item.icon"
            :class="[
              item.icon,
              'text-[1.1rem] transition-all duration-300',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                : 'text-slate-400 group-hover/link:text-slate-600 dark:text-slate-500 dark:group-hover/link:text-slate-300',
            ]"
          ></i>
          <span
            v-else
            class="w-1.5 h-1.5 rounded-full transition-all duration-300"
            :class="isActive ? 'bg-indigo-500 scale-125' : 'bg-slate-300'"
          ></span>

          <span
            v-if="!isSidebarOpen && item.statusTag"
            class="absolute top-0 right-0 flex w-2 h-2 -mr-1 -mt-1"
          >
            <span
              class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
              :class="getBadgeColor(item.statusTag)"
            ></span>
            <span
              class="relative inline-flex w-2 h-2 rounded-full border border-white dark:border-zinc-800"
              :class="getBadgeColor(item.statusTag)"
            ></span>
          </span>
        </div>

        <div
          v-if="isSidebarOpen"
          class="flex items-center justify-between flex-1 min-w-0 ml-1"
        >
          <span class="text-[13px] tracking-tight truncate">
            {{ item.label }}
          </span>

          <span
            v-if="item.statusTag"
            class="ml-2 text-[9px] px-1.5 py-[1px] rounded font-bold uppercase tracking-wider shadow-sm"
            :class="getBadgeBgColor(item.statusTag)"
          >
            {{ item.statusTag }}
          </span>
        </div>
      </div>

      <div v-if="hasChildren && isSidebarOpen" class="flex items-center">
        <i
          class="pi pi-chevron-right text-[10px] transition-transform duration-300"
          :class="[
            isExpanded ? 'rotate-90 text-indigo-500' : 'text-slate-400',
            isActive && !isExpanded ? 'text-indigo-400' : '',
          ]"
        ></i>
      </div>

      <div
        v-if="!isSidebarOpen"
        class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-lg pointer-events-none"
      >
        {{ item.label }}
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-slate-800"
        ></div>
      </div>
    </div>

    <div
      v-if="hasChildren && isSidebarOpen"
      class="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
      :style="{
        maxHeight: isExpanded ? '500px' : '0px',
        opacity: isExpanded ? '1' : '0',
      }"
    >
      <ul
        class="relative mt-0.5 space-y-0.5 before:absolute before:left-[21px] before:top-0 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800"
      >
        <SidebarItem
          v-for="child in item.children"
          :key="child.menuId"
          :item="child"
          :is-sidebar-open="isSidebarOpen"
          :depth="depth + 1"
          class="pl-4"
        />
      </ul>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, toRefs, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { MenuNode } from "@/api/menu";

const props = withDefaults(
  defineProps<{
    item: MenuNode;
    isSidebarOpen: boolean;
    depth?: number;
  }>(),
  {
    depth: 0,
  }
);

const { item, isSidebarOpen } = toRefs(props);
const route = useRoute();
const router = useRouter();

const hasChildren = computed(
  () => !!item.value.children && item.value.children.length > 0
);

// 현재 메뉴가 활성화 상태인지 확인
const isActive = computed(() => {
  if (item.value.routerPath === route.path) return true;
  if (hasChildren.value) {
    return checkChildActive(item.value.children);
  }
  return false;
});

const checkChildActive = (children: MenuNode[]): boolean => {
  return children.some((child) => {
    if (child.routerPath === route.path) return true;
    if (child.children && child.children.length > 0) {
      return checkChildActive(child.children);
    }
    return false;
  });
};

const isExpanded = ref(false);

const handleClick = () => {
  if (hasChildren.value) {
    // 하위 메뉴가 있을 때
    isExpanded.value = !isExpanded.value;
    
    // [UX] 사이드바가 닫혀있는데 하위 메뉴를 보려 하면, 사이드바를 열어주는 것이 가장 자연스러운 UX입니다.
    // 닫힌 상태에서 2-depth 이상을 표현하는 것은 복잡도를 높이므로, 클릭 시 확장시킵니다.
    if (!isSidebarOpen.value) {
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: true }));
    }
  } else if (item.value.routerPath) {
    // 링크 이동
    router.push(item.value.routerPath);
  }
};

const autoExpand = () => {
  if (hasChildren.value && checkChildActive(item.value.children)) {
    isExpanded.value = true;
  }
};

// [Design System] 뱃지 스타일
const getBadgeBgColor = (tag: string) => {
  switch (tag.toUpperCase()) {
    case "NEW": return "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300";
    case "BETA": return "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300";
    case "HOT": return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300";
    default: return "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400";
  }
};

const getBadgeColor = (tag: string) => {
  switch (tag.toUpperCase()) {
    case "NEW": return "bg-rose-500";
    case "BETA": return "bg-violet-500";
    case "HOT": return "bg-orange-500";
    default: return "bg-slate-400";
  }
};

watch(() => route.path, autoExpand);
onMounted(autoExpand);
</script>

<style scoped>
/* Tooltip Animation */
.group\/item:hover .group-hover\/item\:visible {
  transition-delay: 0.1s; /* 마우스 스쳐지나갈 때 깜빡임 방지 */
}
</style>

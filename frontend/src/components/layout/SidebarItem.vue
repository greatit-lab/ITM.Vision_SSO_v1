<!-- frontend/src/components/layout/SidebarItem.vue -->
<template>
  <li class="relative">
    <div
      @click="handleClick"
      class="group flex items-center justify-between min-h-[44px] px-3 py-2.5 my-0.5 mx-2 rounded-xl cursor-pointer transition-all duration-300 select-none border border-transparent"
      :class="[
        // 활성화 상태 디자인 (Active)
        isActive
          ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm border-indigo-100 dark:border-indigo-500/20'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200',

        // 사이드바 닫힘 상태 (Closed)
        !isSidebarOpen && 'justify-center px-0 mx-1',
      ]"
    >
      <div class="flex items-center flex-1 min-w-0 gap-3">
        <div class="relative flex items-center justify-center shrink-0">
          <i
            v-if="item.icon"
            :class="[
              item.icon,
              'text-lg transition-colors duration-300',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
            ]"
          ></i>
          <span
            v-else
            class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
            :class="
              isActive
                ? 'bg-indigo-500'
                : 'bg-slate-300 group-hover:bg-slate-400'
            "
          ></span>
        </div>

        <span
          v-show="isSidebarOpen"
          class="text-sm font-medium truncate transition-all duration-300 origin-left"
          :class="isActive ? 'font-bold' : ''"
        >
          {{ item.label }}
        </span>
      </div>

      <div v-if="hasChildren && isSidebarOpen" class="flex items-center ml-2">
        <i
          class="pi pi-chevron-right text-[10px] text-slate-400 transition-transform duration-300"
          :class="isExpanded ? 'rotate-90 text-indigo-500' : ''"
        ></i>
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
        class="relative mt-1 space-y-0.5 before:absolute before:left-[22px] before:top-0 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800"
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
    depth?: number; // 계층 깊이 (Indentation 용)
  }>(),
  {
    depth: 0,
  }
);

const { item, isSidebarOpen } = toRefs(props);
const route = useRoute();
const router = useRouter();

// 하위 메뉴 존재 여부
const hasChildren = computed(
  () => !!item.value.children && item.value.children.length > 0
);

// 현재 메뉴가 활성화 상태인지 확인 (현재 라우트와 일치하거나, 자식 중에 활성화된 것이 있는지)
const isActive = computed(() => {
  // 1. 직접 일치
  if (item.value.routerPath === route.path) return true;
  // 2. 자식 중 일치하는 항목이 있으면 부모도 Active (Expanded 처리는 별도)
  if (hasChildren.value) {
    return checkChildActive(item.value.children);
  }
  return false;
});

// 재귀적으로 자식 활성화 여부 확인
const checkChildActive = (children: MenuNode[]): boolean => {
  return children.some((child) => {
    if (child.routerPath === route.path) return true;
    if (child.children && child.children.length > 0) {
      return checkChildActive(child.children);
    }
    return false;
  });
};

// 메뉴 확장/축소 상태
const isExpanded = ref(false);

// 클릭 핸들러
const handleClick = () => {
  if (hasChildren.value) {
    // 하위 메뉴가 있으면 토글
    isExpanded.value = !isExpanded.value;

    // 사이드바가 닫혀있었다면 열기 이벤트 발생 (UX)
    if (!isSidebarOpen.value) {
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: true }));
    }
  } else if (item.value.routerPath) {
    // 링크가 있으면 이동
    router.push(item.value.routerPath);
  }
};

// 초기 로드 및 라우트 변경 시 자동으로 메뉴 펼치기
const autoExpand = () => {
  if (hasChildren.value && checkChildActive(item.value.children)) {
    isExpanded.value = true;
  }
};

watch(() => route.path, autoExpand);
onMounted(autoExpand);
</script>

<style scoped>
/* Glassmorphism 미세 조정 */
.group:hover {
  backdrop-filter: blur(8px);
}
</style>

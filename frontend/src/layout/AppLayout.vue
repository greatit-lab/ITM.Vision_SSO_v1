<!-- frontend/src/layout/AppLayout.vue -->
<template>
  <div class="w-full h-full relative">
    <div class="absolute inset-0 overflow-y-auto custom-scrollbar p-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
// Sidebar와 Header는 App.vue에서 관리하므로 제거합니다.
</script>

<style scoped>
/* 스크롤바 등 공통 스타일 */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-zinc-700 rounded-full;
}

/* 페이드 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

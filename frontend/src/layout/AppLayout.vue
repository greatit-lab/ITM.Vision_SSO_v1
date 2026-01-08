<!-- frontend/src/layout/AppLayout.vue -->
<template>
  <div class="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden font-sans">
    
    <AppSidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader />

      <main class="flex-1 p-6 overflow-hidden relative">
        <div class="absolute inset-0 p-6 overflow-y-auto custom-scrollbar">
           <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
           </router-view>
        </div>
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
// 기존 컴포넌트를 가져옵니다.
import AppHeader from '@/components/layout/Header.vue';
import AppSidebar from '@/components/layout/Sidebar.vue';
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
</style>

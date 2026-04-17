<!-- frontend/src/App.vue -->
<template>
  <Toast />
  <ConfirmDialog />

  <div
    class="min-h-screen bg-gray-50 dark:bg-[#09090B] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-500"
  >
    <Sidebar v-if="showSidebar" />

    <main
      class="flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
      :class="showSidebar ? (isSidebarOpen ? 'ml-60' : 'ml-[70px]') : 'w-full'"
    >
      <Header v-if="showSidebar" />

      <div class="relative flex-1" :class="{ 'px-5 pt-2 pb-0': showSidebar }">
        <router-view v-slot="{ Component, route }">
          <transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>

  <div v-if="popups.length > 0">
    <NoticePopup 
      :notices="popups"
      @close="closeAllPopups"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Sidebar from "@/components/layout/Sidebar.vue";
import Header from "@/components/layout/Header.vue";

// PrimeVue 전역 컴포넌트 Import
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

// 팝업 관련 Import
import { boardApi } from '@/api/board';
import NoticePopup from '@/components/common/NoticePopup.vue';

const route = useRoute();
const router = useRouter(); // [추가] 라우터 객체 가져오기
const authStore = useAuthStore();
const isSidebarOpen = ref(true);

// 팝업 목록 상태 (배열 구조 유지)
const popups = ref<any[]>([]);

// [신규] 동적 전환 애니메이션 상태 (기본값: fade)
const transitionName = ref("fade");

// [신규] 페이지 이동을 감지하여 조건부로 애니메이션 이름 변경
router.beforeEach((to, from, next) => {
  // Global Dashboard에서 Site Overview(home)로 갈 때만 page-zoom 적용
  if (from.name === "global-dashboard" && to.name === "home") {
    transitionName.value = "page-zoom";
  } else {
    // 그 외의 모든 이동은 기본 fade 적용
    transitionName.value = "fade";
  }
  next();
});

const isLoginPage = computed(() => route.path === "/login");

// 사이드바와 헤더를 보여줄지 결정하는 통합 조건
const showSidebar = computed(() => !isLoginPage.value && authStore.isAuthenticated);

const handleSidebarToggle = (event: Event) => {
  const customEvent = event as CustomEvent;
  isSidebarOpen.value = customEvent.detail;
};

// 팝업 데이터 조회 로직 정리
const fetchPopups = async () => {
  if (!authStore.isAuthenticated) {
    popups.value = [];
    return;
  }

  try {
    const res = await boardApi.getPopups();
    // 배열 전체를 할당합니다.
    popups.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (e) {
    console.error("Failed to fetch popups", e);
  }
};

// 슬라이드 컴포넌트에서 모두 닫기 이벤트가 오면 팝업 배열 비우기
const closeAllPopups = () => {
  popups.value = [];
};

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      fetchPopups();
    } else {
      popups.value = [];
    }
  }
);

onMounted(() => {
  window.addEventListener("sidebar-toggle", handleSidebarToggle);
  fetchPopups();
});

onUnmounted(() => {
  window.removeEventListener("sidebar-toggle", handleSidebarToggle);
});
</script>

<style>
/* 스크롤바 커스터마이징 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}

/* [복구] 기존의 일반적인 라우터 뷰 전환 애니메이션 (Fade) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

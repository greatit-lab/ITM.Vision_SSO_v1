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
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>

  <div v-if="popups.length > 0">
    <NoticePopup 
      v-for="popup in popups" 
      :key="popup.postId" 
      :notice="popup"
      @close="removePopup(popup.postId)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Sidebar from "@/components/layout/Sidebar.vue";
import Header from "@/components/layout/Header.vue";

// PrimeVue 전역 컴포넌트 Import
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

// [추가] 팝업 관련 Import
import { boardApi } from '@/api/board';
import NoticePopup from '@/components/common/NoticePopup.vue';

const route = useRoute();
const authStore = useAuthStore();
const isSidebarOpen = ref(true);

// [추가] 팝업 목록 상태
const popups = ref<any[]>([]);

const isLoginPage = computed(() => route.path === "/login");

// 사이드바와 헤더를 보여줄지 결정하는 통합 조건
const showSidebar = computed(() => !isLoginPage.value && authStore.isAuthenticated);

const handleSidebarToggle = (event: Event) => {
  const customEvent = event as CustomEvent;
  isSidebarOpen.value = customEvent.detail;
};

// [추가] 팝업 표시 여부 체크 (LocalStorage 확인)
const checkPopupVisibility = (notice: any) => {
  const storageKey = `notice_hide_${notice.postId}`;
  const hideUntil = localStorage.getItem(storageKey);
  
  if (hideUntil) {
    const now = new Date();
    const expiryDate = new Date(hideUntil);
    // 현재 시간이 유효기간보다 크면(지났으면) 다시 보여줌
    return now > expiryDate;
  }
  return true; // 설정값이 없으면 보여줌
};

// [추가] 팝업 데이터 조회
const fetchPopups = async () => {
  try {
    const res = await boardApi.getPopups();
    // API 응답 구조에 따라 데이터 추출 (배열인지 확인)
    const allPopups = Array.isArray(res.data) ? res.data : (res.data.data || []);
    
    // 로컬 스토리지 체크 후 보여줄 것만 필터링
    popups.value = allPopups.filter(checkPopupVisibility);
  } catch (e) {
    console.error("Failed to fetch popups", e);
  }
};

// [추가] 팝업 닫기 핸들러
const removePopup = (id: number) => {
  popups.value = popups.value.filter(p => p.postId !== id);
};

onMounted(() => {
  window.addEventListener("sidebar-toggle", handleSidebarToggle);
  
  // [추가] 앱 실행 시 팝업 공지 불러오기
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

/* 라우터 뷰 전환 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

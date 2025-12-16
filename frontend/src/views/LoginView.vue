<!-- frontend/src/views/LoginView.vue -->
<template>
  <div
    class="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#09090B] relative overflow-hidden font-sans transition-colors duration-500"
  >
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1s;"></div>

    <div
      class="relative z-10 w-full max-w-md p-8 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl flex flex-col items-center transform transition-all hover:scale-[1.01]"
    >
      <div class="w-16 h-16 mb-6 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-slate-100 dark:border-zinc-800">
         <i class="pi pi-objects-column text-3xl text-indigo-500"></i>
      </div>

      <div class="text-center mb-10">
        <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          ITM Vision
        </h1>
        <p class="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em]">
          Smart Factory Solution
        </p>
        <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Sign in to access your dashboard and monitor real-time equipment status.
        </p>
      </div>

      <div class="w-full space-y-4">
        <button
          @click="handleSsoLogin"
          :disabled="isLoading"
          class="group w-full relative flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <i v-if="isLoading" class="pi pi-spin pi-spinner text-lg"></i>
          <i v-else class="pi pi-microsoft text-lg"></i>
          
          <span>{{ isLoading ? 'Connecting to AD...' : 'Sign in with SSO' }}</span>
          
          <i class="pi pi-arrow-right absolute right-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300 text-xs"></i>
        </button>

        <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
            <span class="flex-shrink-0 mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Access</span>
            <div class="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-[10px] text-slate-400 dark:text-zinc-600 font-medium">
          &copy; 2025 GreatIT Lab. All rights reserved.<br/>
          Authorized personnel only.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Auth Store 가정

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(false);

// 1. SSO 로그인 버튼 클릭 핸들러
const handleSsoLogin = () => {
  isLoading.value = true;
  // 백엔드의 SAML 시작 엔드포인트로 리다이렉트
  // window.location.href 사용 (외부 링크 이동)
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`;
};

// 2. 백엔드에서 리다이렉트되어 돌아왔을 때 토큰 처리
onMounted(async () => {
  // URL 쿼리 파라미터 확인 (?token=...&user=...)
  const token = route.query.token as string;
  const userStr = route.query.user as string;
  const error = route.query.error;

  if (error) {
    alert('Login Failed: ' + error);
    router.replace('/login'); // URL 정리
    return;
  }

  if (token) {
    isLoading.value = true;
    try {
      // 사용자 정보 파싱 (Backend AuthController에서 보낸 JSON 문자열)
      const userInfo = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
      
      // Pinia Store에 저장
      authStore.setToken(token);
      if (userInfo) {
        authStore.setUser(userInfo);
      }

      // 메인 페이지로 이동
      router.push('/');
    } catch (e) {
      console.error('Token processing error:', e);
      alert('Authentication error occurred.');
    } finally {
      isLoading.value = false;
    }
  }
});
</script>

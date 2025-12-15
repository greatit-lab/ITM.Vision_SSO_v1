<!-- frontend/src/views/LoginView.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090B]">
    <div class="w-full max-w-md p-8 bg-white dark:bg-[#111111] rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 text-center">
      <div class="mb-6">
        <div class="w-16 h-16 mx-auto bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
           <i class="pi pi-shield text-3xl text-white dark:text-slate-900"></i>
        </div>
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">ITM Vision</h2>
        <p class="mt-2 text-sm text-slate-500">Secure Access via SSO</p>
      </div>

      <div class="mt-8">
        <Button 
          @click="loginWithSAML"
          label="Sign in with SSO (SAML)" 
          icon="pi pi-lock" 
          class="w-full !py-3 !rounded-xl !font-bold !bg-indigo-600 hover:!bg-indigo-700 border-none text-white shadow-md transition-all hover:scale-[1.02]" 
        />
        <p class="text-xs text-slate-400 mt-4">
          Redirects to corporate login page.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loginWithSAML = () => {
  // 개발 PC: http://localhost:8082/api/auth/login
  // 운영 서버: https://10.0.0.1:8080/api/auth/login
  // 상대 경로('/api/...')를 사용하면 현재 접속된 도메인/포트를 따라가므로 자동 대응됩니다.
  window.location.href = '/api/auth/login';
};

onMounted(() => {
  // SAML 콜백 후 URL에 담겨온 token 처리
  const { token, user } = route.query;
  if (token && typeof token === 'string') {
    const userInfo = user ? JSON.parse(decodeURIComponent(user as string)) : null;
    authStore.setSession(token, userInfo);
    router.replace('/'); // URL 클린업 및 홈 이동
  }
});
</script>

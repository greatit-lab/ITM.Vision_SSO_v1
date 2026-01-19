<!-- frontend/src/views/LoginView.vue -->
<template>
  <div
    class="flex items-center justify-center min-h-screen overflow-hidden bg-[url('/images/login-bg.png')] bg-cover bg-center bg-no-repeat relative"
  >
    <div class="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] z-0"></div>

    <div
      class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse z-0"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse z-0"
      style="animation-delay: 1s"
    ></div>

    <div
      class="relative z-10 w-full max-w-sm p-8 transition-all duration-300 border shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-white/20 dark:border-white/10 rounded-3xl"
    >
      <div class="flex flex-col items-center mb-10 text-center">
        <div class="mb-6 transition-transform duration-300 hover:scale-105">
          <img 
            :src="logoUrl" 
            alt="ITM Vision Logo" 
            class="h-16 w-auto drop-shadow-lg object-contain filter"
          />
        </div>
        
        <h1
          class="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-200"
        >
          I:Vision AD
        </h1>
        
        <p class="mt-2 text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
          Enterprise Data Intelligence Platform
        </p>
      </div>

      <div v-if="!errorType" class="space-y-5">
        <Button
          label="Login with ITM AD"
          icon="pi pi-microsoft"
          class="w-full !py-4 !rounded-xl !font-bold !text-base !bg-[#0078D4] hover:!bg-[#006cbd] !border-none !shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          @click="startSsoLogin"
          :loading="isLoading"
        />
        <p class="text-[11px] text-center text-slate-400 dark:text-slate-500">
          Secure access via corporate Active Directory
        </p>
      </div>

      <div
        v-else
        class="flex flex-col gap-4 p-5 border rounded-2xl animate-fadein"
        :class="getErrorClass(errorType)"
      >
        <div class="text-center">
          <div
            class="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full shadow-inner"
            :class="getErrorIconClass(errorType)"
          >
            <i class="text-xl pi" :class="getIconByError(errorType)"></i>
          </div>

          <h3 class="text-lg font-bold" :class="getErrorTextClass(errorType)">
            {{ getTitleByError(errorType) }}
          </h3>

          <p class="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <span v-if="guestForm.loginId" class="block mb-1">
              Account: <span class="font-bold font-mono">{{ guestForm.loginId }}</span>
            </span>
            {{ getMessageByError(errorType) }}
          </p>
        </div>

        <Button
          v-if="errorType === 'AccessDenied'"
          label="Request Guest Access"
          icon="pi pi-key"
          severity="help"
          class="w-full !py-2.5 !text-sm !font-bold !rounded-lg"
          @click="showGuestDialog = true"
        />

        <div
          v-else-if="errorType === 'PendingApproval'"
          class="p-3 text-xs font-bold text-center text-amber-700 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-100 dark:border-amber-800"
        >
          <i class="pi pi-clock mr-1"></i> Awaiting administrator approval.
        </div>

        <Button
          v-else-if="errorType === 'Rejected'"
          label="Re-request Access"
          icon="pi pi-refresh"
          severity="danger"
          outlined
          class="w-full !py-2.5 !text-sm !font-bold !rounded-lg"
          @click="showGuestDialog = true"
        />

        <div class="text-center mt-2">
          <a
            href="#"
            @click.prevent="resetState"
            class="text-[11px] font-medium text-slate-400 hover:text-indigo-500 transition-colors hover:underline"
            >Return to Login</a
          >
        </div>
      </div>

      <div class="mt-10 text-center space-y-1">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">
          Memory CMP Technology Team
        </p>
        <p class="text-[10px] text-slate-400 dark:text-zinc-600 font-medium">
          Copyright &copy; 2025 gily.choi@samsung.com
        </p>
      </div>
    </div>

    <Dialog
      v-model:visible="showGuestDialog"
      modal
      :style="{ width: '90vw', maxWidth: '400px' }"
      :draggable="false"
      class="backdrop-blur-sm"
      :showHeader="false"
      contentClass="!p-0 !rounded-2xl overflow-hidden"
    >
      <div class="flex flex-col bg-white dark:bg-[#18181b]">
        <div class="bg-slate-50 dark:bg-zinc-900/50 p-6 text-center border-b border-slate-100 dark:border-zinc-800">
           <img :src="logoUrl" alt="Logo" class="h-10 w-auto mx-auto mb-3 opacity-90" />
           <h3 class="text-lg font-bold text-slate-800 dark:text-white">Guest Access Request</h3>
           <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Data Intelligence Platform</p>
        </div>

        <div class="p-6 flex flex-col gap-5">
          <div
            v-if="errorType === 'Rejected'"
            class="p-3 text-xs leading-relaxed bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30 flex items-start gap-2"
          >
            <i class="pi pi-info-circle mt-0.5"></i>
            <div>
              <span class="font-bold block mb-0.5">Previous Request Rejected</span>
              Your previous access request was declined. Please update your reason and try again.
            </div>
          </div>
          
          <p v-else class="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed">
            Your account is not authorized.<br/>
            Request access with your verified department info.
          </p>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 ml-1">Login ID</label>
              <div class="relative">
                <i class="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <InputText
                  v-model="guestForm.loginId"
                  disabled
                  class="!pl-9 !w-full !bg-slate-100 dark:!bg-zinc-800 !text-slate-500 !border-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 ml-1">Dept Code</label>
                <InputText
                  v-model="guestForm.deptCode"
                  disabled
                  class="!w-full !bg-slate-100 dark:!bg-zinc-800 !text-slate-500 !border-none text-center"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 ml-1">Dept Name</label>
                <InputText
                  v-model="guestForm.deptName"
                  disabled
                  class="!w-full !bg-slate-100 dark:!bg-zinc-800 !text-slate-500 !border-none text-center"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 ml-1">
                Reason for Access <span class="text-rose-500">*</span>
              </label>
              <InputText
                v-model="guestForm.reason"
                placeholder="Why do you need access?"
                class="!w-full focus:!ring-indigo-500/30"
              />
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
          <Button
            label="Cancel"
            text
            severity="secondary"
            @click="showGuestDialog = false"
            class="!px-4 !py-2 !text-sm"
          />
          <Button
            label="Submit Request"
            icon="pi pi-send"
            @click="submitGuestRequest"
            :loading="isRequesting"
            class="!px-4 !py-2 !text-sm !bg-indigo-600 hover:!bg-indigo-700 !border-none"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import http from "@/api/http";
// [중요] 로고 이미지 import
import logoUrl from "@/assets/ITM_Vision.png";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(false);
const errorType = ref<string | null>(null);
const showGuestDialog = ref(false);
const isRequesting = ref(false);

const guestForm = reactive({
  loginId: "",
  deptName: "",
  deptCode: "",
  reason: "",
});

// URL Query 감지
watch(
  () => route.query,
  (newQuery) => {
    try {
      const errorParam = newQuery.error as string;

      if (errorParam) {
        errorType.value = errorParam;
        guestForm.loginId = (newQuery.loginId as string) || "";
        guestForm.deptCode = (newQuery.deptCode as string) || "";
        guestForm.deptName = (newQuery.deptName as string) || "";
      } else if (newQuery.token) {
        const token = newQuery.token as string;
        const userStr = newQuery.user as string;
        if (token && userStr) {
          const userObj = JSON.parse(decodeURIComponent(userStr));
          authStore.setAuth(token, userObj);
          router.push("/");
        }
      }
    } catch (e) {
      console.error("Query param processing error:", e);
    }
  },
  { immediate: true }
);

// UI Helpers (스타일링 로직)
const getErrorClass = (type: string | null) => {
  if (type === "PendingApproval")
    return "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30";
  return "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30";
};
const getErrorIconClass = (type: string | null) => {
  if (type === "PendingApproval") return "bg-amber-100 text-amber-600";
  return "bg-red-100 text-red-600";
};
const getErrorTextClass = (type: string | null) => {
  if (type === "PendingApproval") return "text-amber-700 dark:text-amber-400";
  return "text-red-700 dark:text-red-400";
};

const getIconByError = (type: string | null) => {
  if (type === "PendingApproval") return "pi-clock";
  if (type === "Rejected") return "pi-times-circle";
  if (type === "ServerErrors") return "pi-exclamation-triangle";
  return "pi-lock";
};
const getTitleByError = (type: string | null) => {
  if (type === "PendingApproval") return "Approval Pending";
  if (type === "Rejected") return "Request Rejected";
  if (type === "ServerErrors") return "Server Error";
  if (type === "NoUser") return "User Not Found";
  return "Access Denied";
};
const getMessageByError = (type: string | null) => {
  if (type === "PendingApproval")
    return "Your access request is currently under review by an administrator.";
  if (type === "Rejected") return "We regret to inform you that your access request has been declined.";
  if (type === "ServerErrors") return "A server error occurred during authentication. Please try again later.";
  if (type === "NoUser") return "No user information received from SSO provider.";
  return "You do not have permission to access this system.";
};

const startSsoLogin = () => {
  isLoading.value = true;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const targetUrl = apiBaseUrl
    ? `${apiBaseUrl}/auth/login`
    : '/api/auth/login';
  window.location.href = targetUrl;
};

const submitGuestRequest = async () => {
  if (!guestForm.deptCode && !guestForm.deptName) {
    alert("Department information is missing. Please contact administrator.");
  }
  if (!guestForm.reason) {
    alert("Please provide a reason for your request.");
    return;
  }

  isRequesting.value = true;
  try {
    await http.post("/auth/guest-request", {
      ...guestForm,
    });

    alert("Your guest access request has been submitted successfully.");
    showGuestDialog.value = false;
    errorType.value = "PendingApproval";
    router.replace({ query: { ...route.query, error: "PendingApproval" } });
  } catch (e) {
    console.error(e);
    alert("An error occurred while submitting your request.");
  } finally {
    isRequesting.value = false;
  }
};

const resetState = () => {
  errorType.value = null;
  router.replace({ query: {} });
};
</script>

<style scoped>
@keyframes fadein {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadein {
  animation: fadein 0.5s ease-out forwards;
}
</style>

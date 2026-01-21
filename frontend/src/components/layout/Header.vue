<!-- frontend/src/components/layout/Header.vue -->
<template>
  <header
    class="sticky top-0 z-40 w-full h-12 transition-all duration-300 border-b shadow-sm bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-xl border-slate-200 dark:border-zinc-800"
  >
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center gap-4">
        <h2 class="text-sm font-bold tracking-tight text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <template v-if="pageTitleParts.parent">
            <span class="font-medium hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-default">{{ pageTitleParts.parent }}</span>
            <span class="text-slate-300 dark:text-slate-600 font-light">/</span>
          </template>
          <span class="font-bold text-slate-700 dark:text-slate-200">{{ pageTitleParts.current }}</span>
        </h2>
      </div>

      <div class="flex items-center gap-3">
        
        <div class="flex items-center gap-1 mr-1">
          <button 
            @click="router.push('/support/qna')"
            class="p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
            v-tooltip.bottom="'Q&A Board'"
          >
            <i class="pi pi-question-circle text-lg"></i>
          </button>
          
          <button 
            @click="router.push('/support/manual')"
            class="p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
            v-tooltip.bottom="'User Manual & Downloads'"
          >
            <i class="pi pi-book text-lg"></i>
          </button>
        </div>

        <div class="h-4 border-l border-slate-300 dark:border-zinc-700 mx-1"></div>

        <div class="relative" ref="notificationRef">
          <button 
            @click="toggleNotifications"
            class="relative p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
            :class="{ 'bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400': showNotifications }"
          >
              <i class="pi pi-bell text-lg"></i>
              <span 
                v-if="hasNotification"
                class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-zinc-900 animate-pulse"
              ></span>
          </button>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 translate-y-2"
          >
            <div 
              v-if="showNotifications"
              class="absolute right-0 w-80 mt-2 origin-top-right bg-white border shadow-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none z-50 overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</h3>
              </div>
              
              <div class="max-h-64 overflow-y-auto">
                <div v-if="guestNotification" class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-b border-slate-50 dark:border-zinc-800/50 transition-colors">
                  <div class="flex items-start gap-3">
                    <div class="mt-0.5 text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-full">
                      <i class="pi pi-clock text-xs"></i>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">게스트 권한 만료 안내</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        계정 유효기간이 <span class="font-bold text-rose-500">{{ guestNotification.dDay }}</span>일 남았습니다.<br/>
                        만료일: {{ guestNotification.date }}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-if="pendingRequestCount > 0" class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-b border-slate-50 dark:border-zinc-800/50 transition-colors">
                  <div class="flex items-start gap-3">
                    <div class="mt-0.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-full">
                      <i class="pi pi-user-plus text-xs"></i>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">승인 대기 요청</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        현재 <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ pendingRequestCount }}</span>건의 요청이 대기 중입니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div v-if="!hasNotification" class="px-4 py-8 text-center">
                  <i class="pi pi-bell-slash text-slate-300 dark:text-zinc-600 text-2xl mb-2"></i>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">새로운 알림이 없습니다.</p>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <button 
          v-if="isAdminOrManager"
          @click="handleAdminClick"
          class="p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          v-tooltip.bottom="'Admin Management'"
        >
           <i class="pi pi-cog text-lg"></i>
        </button>

        <div class="h-4 border-l border-slate-300 dark:border-zinc-700 mx-1"></div>

        <button
          @click="toggleTheme"
          class="relative w-12 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden shadow-inner border border-slate-300 dark:border-zinc-700 transition-colors focus:outline-none"
        >
          <div class="absolute top-1/2 left-1.5 transform -translate-y-1/2 transition-all duration-500"
               :class="isDark ? 'opacity-40 scale-75' : 'opacity-100 scale-100'">
            <i class="pi pi-sun text-amber-500 text-[10px]"></i>
          </div>
          <div class="absolute top-1/2 right-1.5 transform -translate-y-1/2 transition-all duration-500"
               :class="!isDark ? 'opacity-40 scale-75' : 'opacity-100 scale-100'">
            <i class="pi pi-moon text-indigo-400 text-[10px]"></i>
          </div>
          <div
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-md transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center z-10"
            :class="isDark ? 'translate-x-[24px]' : 'translate-x-0'"
          >
             <i class="pi text-[8px]" :class="isDark ? 'pi-moon text-indigo-500' : 'pi-sun text-amber-500'"></i>
          </div>
        </button>

        <div class="relative ml-2 group" ref="dropdownRef">
          <button
            @click="toggleUserDropdown"
            class="flex items-center gap-2.5 pl-2 pr-1 py-1 transition-all duration-200 rounded-full group hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
          >
          <span class="hidden text-sm font-bold text-slate-700 dark:text-slate-200 sm:block">
              {{ authStore.userName }}님
            </span>
            <div
              class="flex items-center justify-center w-7 h-7 text-xs font-bold text-white shadow-md rounded-full ring-2 ring-white dark:ring-zinc-900 transition-all"
              :class="getUserAvatarColor(authStore.user?.userId)"
            >
              {{ userAvatarInitial }}
            </div>
            <i class="text-[10px] pi pi-chevron-down text-slate-400 group-hover:text-indigo-500 transition-colors"></i>
          </button>

          <div 
            v-if="!isUserDropdownOpen"
            class="absolute top-full right-0 mt-2 hidden group-hover:block z-50 px-2 py-1.5 text-xs font-medium text-white bg-slate-800 dark:bg-zinc-700 rounded-md shadow-lg break-words whitespace-normal max-w-[200px] w-max text-center"
          >
            {{ authStore.user?.departmentName || 'No Department' }}
          </div>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 translate-y-2"
          >
            <div
              v-if="isUserDropdownOpen"
              class="absolute right-0 w-52 mt-2 origin-top-right bg-white border shadow-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none z-50 overflow-hidden"
            >
              <div class="py-1">
                <button
                  @click="openProfileSettings"
                  class="flex items-center w-full px-4 py-2.5 text-xs text-slate-700 transition-colors dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80"
                >
                  <i class="mr-3 text-slate-400 pi pi-user"></i> Profile Settings
                </button>
              </div>
              
              <div class="py-1 border-t border-slate-100 dark:border-zinc-800">
                <button
                  @click="handleLogout"
                  class="flex items-center w-full px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <i class="mr-3 pi pi-sign-out"></i> Sign out
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="isProfileModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeProfileSettings"></div>
          <div class="relative w-full max-w-md p-6 bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 transform transition-all scale-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Profile Settings</h3>
              <button @click="closeProfileSettings" class="text-slate-400 hover:text-slate-600 transition-colors">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="mb-6 space-y-3">
              <div class="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 flex items-center justify-center text-white rounded-full text-xl font-bold shadow-lg"
                       :class="getUserAvatarColor(authStore.user?.userId)">
                     {{ userAvatarInitial }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white text-lg">{{ authStore.userName }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ authStore.user?.email }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-[7fr_3fr] gap-3 text-xs">
                  <div class="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span class="block text-slate-400 font-semibold mb-0.5">Department</span>
                    <span class="text-slate-700 dark:text-slate-200 font-medium truncate" :title="authStore.user?.departmentName">{{ authStore.user?.departmentName || '-' }}</span>
                  </div>
                   <div class="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span class="block text-slate-400 font-semibold mb-0.5">Role</span>
                    <span class="font-bold" :class="getRoleTextColor(authStore.user?.role)">{{ authStore.user?.role || 'User' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="saveProfileSettings" class="space-y-4">
              <div class="relative">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Default Site</label>
                <div class="relative group">
                  <select 
                    v-model="selectedSite" 
                    @change="handleSiteChange" 
                    class="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none text-xs font-medium appearance-none cursor-pointer pr-8"
                  >
                    <option value="" disabled>Select Site</option>
                    <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
                  </select>
                  <div v-if="selectedSite" @click="clearSite" class="absolute top-1/2 right-8 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer p-1 transition-colors z-10" title="Clear Selection">
                    <i class="pi pi-times text-[10px]"></i>
                  </div>
                </div>
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Default SDWT</label>
                <div class="relative group">
                  <select 
                    v-model="selectedSdwt" 
                    :disabled="!selectedSite" 
                    class="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none text-xs font-medium appearance-none cursor-pointer disabled:opacity-50 pr-8"
                  >
                     <option value="" disabled>Select SDWT</option>
                     <option v-for="sdwt in sdwts" :key="sdwt" :value="sdwt">{{ sdwt }}</option>
                  </select>
                  <div v-if="selectedSdwt" @click="clearSdwt" class="absolute top-1/2 right-8 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer p-1 transition-colors z-10" title="Clear Selection">
                    <i class="pi pi-times text-[10px]"></i>
                  </div>
                </div>
              </div>

              <div class="pt-4 flex gap-3">
                <button type="button" @click="closeProfileSettings" class="flex-1 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">Cancel</button>
                <button 
                  type="submit" 
                  :disabled="isSaving || !selectedSite || !selectedSdwt" 
                  class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useMenuStore } from "@/stores/menu"; 
import { dashboardApi } from "@/api/dashboard"; 
import * as AdminApi from "@/api/admin";
import http from "@/api/http"; 
import type { MenuNode } from "@/api/menu"; 

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const menuStore = useMenuStore(); 

// [수정] 드롭다운 상태 관리
const isUserDropdownOpen = ref(false); // 사용자 메뉴용
const showNotifications = ref(false); // 알림 메뉴용

const dropdownRef = ref<HTMLElement | null>(null);
const notificationRef = ref<HTMLElement | null>(null);

const isDark = ref(false);
const isProfileModalOpen = ref(false);
const isSaving = ref(false);
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const selectedSite = ref("");
const selectedSdwt = ref("");
const pendingRequestCount = ref(0);

const userAvatarInitial = computed(() => {
  const userId = user.value?.userId;
  return userId ? userId.charAt(0).toUpperCase() : 'U';
});

const getUserAvatarColor = (userId?: string) => {
  if (!userId) return 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-500/30';
  const charCode = userId.charAt(0).toUpperCase().charCodeAt(0);
  const colorIndex = charCode % 8;
  const gradients = [
    'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/30',
    'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30',
    'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30',
    'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    'bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-500/30',
    'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30',
    'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30',
    'bg-gradient-to-br from-violet-500 to-violet-600 shadow-violet-500/30',
  ];
  return gradients[colorIndex];
};

const getRoleTextColor = (role?: string) => {
  const r = role?.toUpperCase();
  if (r === 'ADMIN') return 'text-rose-600 dark:text-rose-400';
  if (r === 'MANAGER') return 'text-indigo-600 dark:text-indigo-400';
  if (r === 'USER') return 'text-emerald-600 dark:text-emerald-400';
  return 'text-slate-600';
}

const isAdminOrManager = computed(() => {
  return authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER';
});

const pageTitleParts = computed(() => {
  const findBreadcrumb = (nodes: MenuNode[], targetPath: string, parents: string[]): string | null => {
    for (const node of nodes) {
      const nodePath = (node.routerPath || '').replace(/\/$/, '');
      const target = targetPath.replace(/\/$/, '');
      if (nodePath && nodePath === target) {
        return [...parents, node.label].join(' / ');
      }
      if (node.children && node.children.length > 0) {
        const found = findBreadcrumb(node.children, targetPath, [...parents, node.label]);
        if (found) return found;
      }
    }
    return null;
  };
  let fullTitle = "Overview";
  const path = route.path;
  if (path.startsWith('/admin')) {
    if (path.includes('/menus')) fullTitle = "Management / Menus";
    else if (path.includes('/users')) fullTitle = "Management / Users";
    else if (path.includes('/infra')) fullTitle = "Management / Infra";
    else if (path.includes('/system')) fullTitle = "Management / System";
    else fullTitle = "Management";
  } else if (path.startsWith('/support')) {
    // [New] Support Title Handling
    if (path.includes('/qna')) fullTitle = "Support / Q&A Board";
    else if (path.includes('/manual')) fullTitle = "Support / User Manual";
    else fullTitle = "Support";
  } else if (menuStore.menus.length > 0) {
    const breadcrumb = findBreadcrumb(menuStore.menus, route.path, []);
    if (breadcrumb) fullTitle = breadcrumb;
  }
  if (fullTitle.includes(" / ")) {
    const parts = fullTitle.split(" / ");
    const current = parts.pop();
    return { parent: parts.join(" / "), current: current };
  }
  return { parent: null, current: fullTitle };
});

const handleAdminClick = () => {
  if (authStore.user?.role === 'ADMIN') router.push({ name: 'admin-menus' });
  else router.push({ name: 'admin-users' });
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
};

// [수정] 드롭다운 토글 로직
const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
  if(isUserDropdownOpen.value) showNotifications.value = false;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if(showNotifications.value) isUserDropdownOpen.value = false;
};

const handleLogout = () => authStore.logout();

const handleClickOutside = (event: MouseEvent) => {
  if (isUserDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isUserDropdownOpen.value = false;
  }
  if (showNotifications.value && notificationRef.value && !notificationRef.value.contains(event.target as Node)) {
    showNotifications.value = false;
  }
};

const loadSdwts = async (site: string) => {
  try {
    const res = await dashboardApi.getSdwts(site);
    sdwts.value = res;
  } catch (e) {
    sdwts.value = [];
  }
};

const handleSiteChange = async () => {
  selectedSdwt.value = ""; 
  if (selectedSite.value) await loadSdwts(selectedSite.value);
  else sdwts.value = [];
};

const clearSite = () => {
  selectedSite.value = "";
  selectedSdwt.value = "";
  sdwts.value = [];
};

const clearSdwt = () => {
  selectedSdwt.value = "";
};

const openProfileSettings = async () => {
  isUserDropdownOpen.value = false;
  isProfileModalOpen.value = true;
  selectedSite.value = "";
  selectedSdwt.value = "";
  try {
    if (sites.value.length === 0) sites.value = await dashboardApi.getSites();
    let dbContext = null;
    const loginId = authStore.user?.userId;
    if (loginId) {
      try {
        const res = await http.get('/auth/context', { params: { loginId } });
        dbContext = res.data; 
      } catch (e) {}
    }
    const targetSite = dbContext?.site || authStore.user?.site;
    const targetSdwt = dbContext?.sdwt || authStore.user?.sdwt;
    if (targetSite) {
      selectedSite.value = targetSite;
      await loadSdwts(targetSite);
      if (targetSdwt && sdwts.value.includes(targetSdwt)) selectedSdwt.value = targetSdwt;
    }
  } catch (e) {}
};

const closeProfileSettings = () => isProfileModalOpen.value = false;

const saveProfileSettings = async () => {
  if (!selectedSite.value || !selectedSdwt.value) return;
  isSaving.value = true;
  try {
    await http.post('/auth/context', { loginId: authStore.user?.userId, site: selectedSite.value, sdwt: selectedSdwt.value });
    if (authStore.user) authStore.setUser({ ...authStore.user, site: selectedSite.value, sdwt: selectedSdwt.value });
    alert("Profile settings have been saved successfully.\n사용자 설정이 성공적으로 저장되었습니다.");
    closeProfileSettings();
    if (route.name === 'home') window.location.reload();
  } catch (e) { 
    alert("Failed to save settings."); 
  } finally { isSaving.value = false; }
};

const fetchNotifications = async () => {
  if (authStore.user?.role === 'ADMIN') {
    try {
      const res = await AdminApi.getGuestRequests();
      pendingRequestCount.value = res.data.filter((req: any) => req.status === 'PENDING').length;
    } catch (e) {}
  }
};

const guestNotification = computed(() => {
  const currentUser = user.value;
   
  if (currentUser?.role?.toUpperCase() !== 'GUEST' || !currentUser.validUntil) {
    return null;
  }

  try {
    const today = new Date();
    const validUntil = new Date(currentUser.validUntil);
    const dateStr = validUntil.toISOString().split('T')[0];
    today.setHours(0,0,0,0);
    validUntil.setHours(0,0,0,0);
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0) {
      return {
        dDay: diffDays,
        date: dateStr
      };
    }
    return null;
  } catch (e) {
    return null;
  }
});

const hasNotification = computed(() => {
  return (pendingRequestCount.value > 0) || (!!guestNotification.value);
});

onMounted(() => {
  if (document.documentElement.classList.contains("dark")) isDark.value = true;
  fetchNotifications();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

// frontend/src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  department: string;
  departmentName: string;
  companyCode: string;
  GrdName?: string;
  groups: string | string[];
  role?: string;
  sessionIndex?: string;
  // [추가] 사용자 컨텍스트
  site?: string;
  sdwt?: string;
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const user = ref<UserInfo | null>(
    localStorage.getItem('user_info') 
      ? JSON.parse(localStorage.getItem('user_info') as string) 
      : null
  );

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || 'Guest');

  const userInitial = computed(() => {
    return user.value?.name ? user.value.name.charAt(0).toUpperCase() : 'U';
  });

  const isAdmin = computed(() => {
    if (user.value?.role === 'ADMIN' || user.value?.role === 'MANAGER') return true;
    if (!user.value?.groups) return false;
    const adminGroups = ['Administrators', 'ITM_Admins', 'System Managers']; 
    const userGroups = user.value.groups;
    if (Array.isArray(userGroups)) {
      return userGroups.some(g => adminGroups.includes(g));
    } else {
      return adminGroups.includes(userGroups);
    }
  });

  const userDetailTooltip = computed(() => {
    const dept = user.value?.departmentName || user.value?.department || 'Unknown Dept';
    const grd = user.value?.GrdName || user.value?.title || ''; 
    return grd ? `${dept} / ${grd}` : dept;
  });

  // --- Actions ---
  const setAuth = (newToken: string, newUser: UserInfo) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(newUser));
  };

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('jwt_token', newToken);
  };

  // 사용자 정보 갱신 (Profile Settings 저장 시 호출)
  const setUser = (newUser: UserInfo) => {
    user.value = newUser;
    localStorage.setItem('user_info', JSON.stringify(newUser));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
  };

  return {
    token,
    user,
    isAuthenticated,
    userName,
    userInitial,
    isAdmin,
    userDetailTooltip,
    setAuth,
    setToken,
    setUser,
    logout
  };
});

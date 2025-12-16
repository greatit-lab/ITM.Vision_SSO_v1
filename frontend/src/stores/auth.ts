// frontend/src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 사용자 정보 타입 정의 (Backend의 User 인터페이스와 매칭)
export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  department?: string;
  groups?: string[];
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', () => {
  // 상태 (State)
  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const user = ref<UserInfo | null>(
    localStorage.getItem('user_info') 
      ? JSON.parse(localStorage.getItem('user_info') as string) 
      : null
  );

  // 게터 (Getters)
  const isAuthenticated = computed(() => !!token.value);
  const getUserName = computed(() => user.value?.name || 'Unknown User');

  // 액션 (Actions)
  
  // 1. 로그인 성공 시 토큰과 사용자 정보 저장
  const setAuth = (newToken: string, newUser: UserInfo) => {
    token.value = newToken;
    user.value = newUser;
    
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(newUser));
  };

  // 2. 토큰만 업데이트 (필요 시)
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('jwt_token', newToken);
  };

  // 3. 사용자 정보만 업데이트
  const setUser = (newUser: UserInfo) => {
    user.value = newUser;
    localStorage.setItem('user_info', JSON.stringify(newUser));
  };

  // 4. 로그아웃 (상태 초기화 및 스토리지 삭제)
  const logout = () => {
    token.value = null;
    user.value = null;
    
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    
    // 필요한 경우 로그인 페이지로 이동하거나 AD 로그아웃 URL 호출 로직 추가
  };

  return {
    token,
    user,
    isAuthenticated,
    getUserName,
    setAuth,
    setToken,
    setUser,
    logout
  };
});

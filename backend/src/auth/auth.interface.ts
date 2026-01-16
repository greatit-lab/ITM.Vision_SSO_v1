// backend/src/auth/auth.interface.ts
export interface User {
  userId: string;
  username?: string;
  password?: string;
  role?: string;
  companyCode?: string;
  department?: string;
  departmentName?: string; // AD Dept Name
  displayName?: string;
  email?: string;
  mobile?: string;
  
  // Context Info
  site?: string;
  sdwt?: string;
  
  // [추가] 게스트 유효기간
  validUntil?: Date | string;

  // Groups
  groups?: string[];
}

export interface LoginResult {
  access_token: string;
  user: User;
}

export interface SyncUserDto {
  loginId?: string;
  username?: string; // Legacy support
}

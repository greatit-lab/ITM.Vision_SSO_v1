// backend/src/auth/auth.interface.ts
export interface User {
  userId: string;
  email: string;
  name: string;
  department: string;     // 부서 코드 (DeptId)
  departmentName: string; // 부서 명 (DeptName)
  companyCode: string;
  groups: string[];
  role?: string;
  sessionIndex?: string;
  // [추가] 사용자 컨텍스트 정보
  site?: string;
  sdwt?: string;
}

export interface LoginResult {
  access_token: string;
  user: User;
}

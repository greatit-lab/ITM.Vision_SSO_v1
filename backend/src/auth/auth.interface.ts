// backend/src/auth/auth.interface.ts

export interface User {
  userId: string;
  email: string;
  name: string;           // 사용자 이름
  
  department: string;     // 부서 코드 (DeptId)
  departmentName: string; // 부서 명 (DeptName)
  companyCode: string;    // 회사 코드 (CompId)
  companyName: string;    // 회사 명 (CompName)
  
  groups: string[];
  role?: string;
  sessionIndex?: string;
  site?: string;
  sdwt?: string;

  // [수정] 게스트 계정 만료 일시 추가 (Date 객체 또는 ISO 문자열 허용)
  validUntil?: Date | string; 
}

export interface LoginResult {
  access_token: string;
  user: User;
}

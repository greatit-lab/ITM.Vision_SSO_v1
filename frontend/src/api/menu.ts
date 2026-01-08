// frontend/src/api/menu.ts
import http from './http';

// [API 응답용] 순수 데이터 모델 (DB 스키마와 일치, null 허용)
export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  children: MenuNode[];
  statusTag?: string | null;
  roles?: string[];
  isVisible?: boolean;
}

// [UI 표시용] TreeTable 호환 모델 (null 불가, undefined 사용)
// Omit을 사용하여 MenuNode의 null 허용 필드를 제거하고, UI용으로 재정의
export interface UIMenuNode extends Omit<MenuNode, 'children' | 'icon' | 'routerPath' | 'statusTag'> {
  key: string;            // TreeTable 필수
  data: MenuNode;         // 원본 데이터 보존
  children: UIMenuNode[]; // 자식 재귀
  
  // [재정의] PrimeVue TreeNode 호환을 위해 null 대신 optional(?) 사용
  icon?: string;          // string | undefined
  routerPath?: string;    // string | undefined
  statusTag?: string;     // string | undefined
}

export interface RolePermission {
  role: string;
  menuId: number;
}

// 1. 내 메뉴 조회
export const fetchMyMenus = () => http.get<MenuNode[]>('/menu/my');

// 2. [관리자용] 전체 메뉴 및 권한 관리
export const fetchAllMenus = () => http.get<MenuNode[]>('/menu/all');
export const fetchPermissions = () => http.get<RolePermission[]>('/menu/permissions');
export const saveRolePermissions = (role: string, menuIds: number[]) => 
  http.post(`/menu/permissions/${role}`, { menuIds });

// 3. [관리자용] 메뉴 CRUD (Store에서 사용)
export const createMenu = (data: Partial<MenuNode>) => http.post('/menu', data);
export const updateMenu = (id: number, data: Partial<MenuNode>) => http.put(`/menu/${id}`, data);
export const deleteMenu = (id: number) => http.delete(`/menu/${id}`);

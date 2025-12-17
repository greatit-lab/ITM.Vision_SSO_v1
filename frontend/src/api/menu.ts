// frontend/src/api/menu.ts
import http from "./http";

// 메뉴 데이터 타입 정의 (백엔드 RefMenu + children 구조)
export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  sortOrder: number;
  statusTag: string | null; // 'BETA', 'NEW' 등
  isVisible: string;
  children?: MenuNode[]; // 계층형 구조
}

export const fetchMyMenus = async () => {
  return await http.get<MenuNode[]>("/menus/my-menus");
};

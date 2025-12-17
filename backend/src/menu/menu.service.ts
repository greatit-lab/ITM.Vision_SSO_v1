// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefMenu } from '@prisma/client'; // [1] Prisma 모델 타입 Import

// [2] 자식 노드를 포함하는 메뉴 타입 정의
type MenuTreeNode = RefMenu & { children: MenuTreeNode[] };

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMyMenus(role: string): Promise<MenuTreeNode[]> {
    let menus: RefMenu[] = []; // [3] 명시적 타입 선언 (초기화 오류 해결)

    if (role === 'ADMIN' || role === 'MANAGER') {
      menus = await this.prisma.refMenu.findMany({
        where: { isVisible: 'Y' },
        orderBy: { sortOrder: 'asc' },
      });
    } else {
      menus = await this.prisma.refMenu.findMany({
        where: {
          isVisible: 'Y',
          roleMappings: {
            some: {
              role: role,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
    }

    return this.buildMenuTree(menus);
  }

  // [4] any 제거 및 타입 적용
  private buildMenuTree(menus: RefMenu[]): MenuTreeNode[] {
    const menuMap = new Map<number, MenuTreeNode>();
    const tree: MenuTreeNode[] = [];

    // Map 초기화
    menus.forEach((menu) => {
      // children 배열을 포함한 객체로 변환하여 저장
      menuMap.set(menu.menuId, { ...menu, children: [] });
    });

    // 부모-자식 연결
    menus.forEach((menu) => {
      const currentMenuItem = menuMap.get(menu.menuId);

      if (!currentMenuItem) return; // 안전장치

      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(currentMenuItem);
        } else {
          // 부모 ID가 있지만 부모를 찾을 수 없는 경우 (데이터 무결성 예외) -> 루트로 취급하거나 무시
          // 여기서는 안전하게 루트로 넣거나, 숨길 수 있음. 로직상 루트로 처리:
          // tree.push(currentMenuItem);
        }
      } else {
        // 부모가 없으면 최상위 메뉴
        tree.push(currentMenuItem);
      }
    });

    return tree;
  }
}

// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefMenu } from '@prisma/client'; // [수정] Prisma 모델 타입 Import

export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  children: MenuNode[];
  statusTag?: string | null;
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  /**
   * 사용자 역할(Role)에 기반한 메뉴 트리 조회
   */
  async getMyMenus(role: string): Promise<MenuNode[]> {
    // 1. 해당 Role이 접근 가능한 메뉴 ID 목록 조회
    const accessibleMenuIds = await this.prisma.cfgMenuRole.findMany({
      where: { role: role },
      select: { menuId: true },
    });

    const menuIds = accessibleMenuIds.map((item) => item.menuId);

    // 2. 메뉴 마스터에서 실제 메뉴 정보 조회
    const menus = await this.prisma.refMenu.findMany({
      where: {
        OR: [
          { menuId: { in: menuIds } },
        ],
        isVisible: 'Y',
      },
      orderBy: { sortOrder: 'asc' },
    });

    // 3. Flat Data -> Tree Structure 변환
    return this.buildMenuTree(menus);
  }

  /**
   * 모든 메뉴 목록 조회 (관리자 설정 화면용)
   */
  async getAllMenus(): Promise<MenuNode[]> {
    const menus = await this.prisma.refMenu.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return this.buildMenuTree(menus);
  }

  /**
   * 재귀적으로 메뉴 트리 구성
   * [수정] 매개변수 타입을 any[] -> RefMenu[] 로 변경하여 Unsafe access 오류 해결
   */
  private buildMenuTree(menus: RefMenu[]): MenuNode[] {
    const map = new Map<number, MenuNode>();
    const roots: MenuNode[] = [];

    // 1. 모든 노드를 Map에 등록 및 children 초기화
    menus.forEach((menu) => {
      map.set(menu.menuId, {
        menuId: menu.menuId,
        label: menu.label,
        routerPath: menu.routerPath,
        icon: menu.icon,
        parentId: menu.parentId,
        statusTag: menu.statusTag,
        children: [],
      });
    });

    // 2. 부모-자식 관계 연결
    menus.forEach((menu) => {
      // menu.parentId가 null일 수 있으므로 체크
      if (menu.parentId && map.has(menu.parentId)) {
        const parent = map.get(menu.parentId);
        // map.get 결과가 undefined가 아님을 확신할 때 ! 사용 (Non-null assertion)
        parent?.children.push(map.get(menu.menuId)!);
      } else {
        // 부모가 없거나 Root인 경우
        roots.push(map.get(menu.menuId)!);
      }
    });

    return roots;
  }
}

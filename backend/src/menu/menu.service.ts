// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefMenu, Prisma } from '@prisma/client';

export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  sortOrder: number | null;
  children: MenuNode[];
  statusTag?: string | null;
  roles?: string[];
}

// DTO 정의
export interface CreateMenuDto {
  label: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  roles?: string[];
}

export interface UpdateMenuDto {
  label?: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  roles?: string[];
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // [핵심 로직 개선] 권한에 따른 메뉴 트리 구성
  async getMyMenus(role: string): Promise<MenuNode[]> {
    // 1. 활성화된 모든 메뉴 가져오기 (구조 계산을 위해 전체 로드 필요)
    const allMenus = await this.prisma.refMenu.findMany({
      where: { isVisible: 'Y' },
      orderBy: { sortOrder: 'asc' },
    });

    // 2. ADMIN은 전체 트리 반환
    if (role === 'ADMIN') {
      return this.buildMenuTree(allMenus);
    }

    // 3. 해당 Role이 접근 가능한 메뉴 ID 목록 조회
    const accessible = await this.prisma.cfgMenuRole.findMany({
      where: { role: role },
      select: { menuId: true },
    });
    const allowedIds = new Set(accessible.map((a) => a.menuId));

    // 4. 권한 기반 필터링 (부모 노드 자동 포함 로직)
    // - 본인에게 권한이 있거나, 권한이 있는 자식을 가진 부모라면 포함
    const validMenus = this.filterMenusRecursive(allMenus, allowedIds);

    return this.buildMenuTree(validMenus);
  }

  // [관리자용] 전체 메뉴 및 권한 매핑 정보 조회
  async getAllMenus(): Promise<MenuNode[]> {
    const menus = await this.prisma.refMenu.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const roleMappings = await this.prisma.cfgMenuRole.findMany();
    
    const roleMap = new Map<number, string[]>();
    roleMappings.forEach(mapping => {
      if (!roleMap.has(mapping.menuId)) {
        roleMap.set(mapping.menuId, []);
      }
      roleMap.get(mapping.menuId)?.push(mapping.role);
    });

    return this.buildMenuTree(menus, roleMap);
  }

  // --- CRUD Operations (기존 유지 및 개선) ---

  async createMenu(data: CreateMenuDto) {
    const { label, routerPath, parentId, icon, sortOrder, statusTag, roles } = data;

    const newMenu = await this.prisma.refMenu.create({
      data: {
        label,
        routerPath: routerPath || null,
        parentId: parentId || null,
        icon: icon || null,
        sortOrder: sortOrder || 0,
        statusTag: statusTag || null,
        isVisible: 'Y',
      },
    });

    if (roles && roles.length > 0) {
      await this.prisma.cfgMenuRole.createMany({
        data: roles.map((role) => ({
          menuId: newMenu.menuId,
          role,
        })),
      });
    }
    return newMenu;
  }

  async updateMenu(id: number, data: UpdateMenuDto) {
    const { label, routerPath, parentId, icon, sortOrder, statusTag, roles } = data;

    const updateData: Prisma.RefMenuUpdateInput = {
      ...(label !== undefined && { label }),
      ...(routerPath !== undefined && { routerPath: routerPath || null }),
      ...(parentId !== undefined && { parentId }),
      ...(icon !== undefined && { icon: icon || null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(statusTag !== undefined && { statusTag: statusTag || null }),
    };

    const updatedMenu = await this.prisma.refMenu.update({
      where: { menuId: id },
      data: updateData,
    });

    if (roles && Array.isArray(roles)) {
      await this.prisma.$transaction(async (tx) => {
        await tx.cfgMenuRole.deleteMany({ where: { menuId: id } });
        if (roles.length > 0) {
          await tx.cfgMenuRole.createMany({
            data: roles.map((role) => ({
              menuId: id,
              role,
            })),
          });
        }
      });
    }
    return updatedMenu;
  }

  async deleteMenu(id: number) {
    // 자식 메뉴가 있는지 확인 후 처리 필요하나, DB FK Cascade 설정에 따라 다름.
    // 안전을 위해 Role 매핑 먼저 삭제
    await this.prisma.cfgMenuRole.deleteMany({ where: { menuId: id } });
    return this.prisma.refMenu.delete({ where: { menuId: id } });
  }

  async updateRolePermissions(role: string, menuIds: number[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.cfgMenuRole.deleteMany({ where: { role } });
      if (menuIds.length > 0) {
        await tx.cfgMenuRole.createMany({
          data: menuIds.map((menuId) => ({ role, menuId })),
        });
      }
    });
  }

  async getAllRolePermissions() {
    return this.prisma.cfgMenuRole.findMany();
  }

  // --- Helper Methods ---

  // [신규] 재귀적 필터링 로직: 자식에게 권한이 있으면 부모도 살린다.
  private filterMenusRecursive(allMenus: RefMenu[], allowedIds: Set<number>): RefMenu[] {
    const menuMap = new Map<number, RefMenu>(allMenus.map(m => [m.menuId, m]));
    const resultIds = new Set<number>();

    // 1. 직접 권한이 있는 메뉴 추가
    allowedIds.forEach(id => resultIds.add(id));

    // 2. 권한 있는 메뉴의 모든 부모(조상) 경로 추가
    allowedIds.forEach(id => {
      let current = menuMap.get(id);
      while (current && current.parentId) {
        const parent = menuMap.get(current.parentId);
        if (parent) {
          resultIds.add(parent.menuId);
          current = parent;
        } else {
          break;
        }
      }
    });

    return allMenus.filter(m => resultIds.has(m.menuId));
  }

  // 트리 구조 변환
  private buildMenuTree(menus: RefMenu[], roleMap?: Map<number, string[]>): MenuNode[] {
    const map = new Map<number, MenuNode>();
    const roots: MenuNode[] = [];

    // 1. 노드 생성
    menus.forEach((menu) => {
      map.set(menu.menuId, {
        menuId: menu.menuId,
        label: menu.label,
        routerPath: menu.routerPath,
        icon: menu.icon,
        parentId: menu.parentId,
        sortOrder: menu.sortOrder,
        statusTag: menu.statusTag,
        children: [],
        roles: roleMap ? (roleMap.get(menu.menuId) || []) : undefined,
      });
    });

    // 2. 트리 연결
    menus.forEach((menu) => {
      if (menu.parentId && map.has(menu.parentId)) {
        const parent = map.get(menu.parentId);
        parent?.children.push(map.get(menu.menuId)!);
      } else {
        roots.push(map.get(menu.menuId)!);
      }
    });

    // 3. 정렬 (재귀)
    const sortNodes = (nodes: MenuNode[]) => {
      nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      nodes.forEach(node => {
        if (node.children.length > 0) sortNodes(node.children);
      });
    };
    sortNodes(roots);

    return roots;
  }
}

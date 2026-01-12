// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// ==========================
// DTO / Interfaces
// ==========================
export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  sortOrder: number | null;
  children: MenuNode[];
  statusTag?: string | null;
  isVisible?: boolean;
  roles?: string[];
}

export class CreateMenuDto {
  label: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean;
  roles?: string[];
}

export class UpdateMenuDto {
  label?: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean;
  roles?: string[];
}

@Injectable()
export class MenuService {
  private readonly DOMAIN = 'menu';

  constructor(private readonly api: DataApiService) {}

  // ==========================
  // Menu APIs
  // ==========================
  async getMyMenus(role: string): Promise<MenuNode[]> {
    // [수정] null이 반환될 경우 빈 배열([])로 처리
    return this.api.request<MenuNode[]>(
      this.DOMAIN,
      'get',
      'my',
      undefined,
      { role }
    ).then(res => res || []);
  }

  async getAllMenus(): Promise<MenuNode[]> {
    // [수정] null이 반환될 경우 빈 배열([])로 처리
    return this.api.request<MenuNode[]>(
      this.DOMAIN,
      'get',
      'all'
    ).then(res => res || []);
  }

  async createMenu(data: CreateMenuDto) {
    return this.api.request(this.DOMAIN, 'post', '', data);
  }

  async updateMenu(id: number, data: UpdateMenuDto) {
    return this.api.request(this.DOMAIN, 'patch', String(id), data);
  }

  async deleteMenu(id: number) {
    return this.api.request(this.DOMAIN, 'delete', String(id));
  }

  async updateRolePermissions(
    role: string,
    menuIds: number[],
  ): Promise<void> {
    // [수정] void 반환 타입 맞춤 (null 무시)
    return this.api.request(
      this.DOMAIN,
      'post',
      'role-permissions',
      { role, menuIds },
    ).then(() => {}); 
  }

  async getAllRolePermissions() {
    return this.api.request(this.DOMAIN, 'get', 'role-permissions');
  }
}

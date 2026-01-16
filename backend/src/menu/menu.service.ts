// backend/src/menu/menu.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

// DTO / Interfaces
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
  private readonly logger = new Logger(MenuService.name);

  constructor(private readonly api: DataApiService) {}

  // 1. 내 메뉴 조회
  async getMyMenus(role: string): Promise<MenuNode[]> {
    this.logger.warn(`[DEBUG-SSO-2] Calling Data-API with Query Param: ?role=${role}`);

    return this.api.request<MenuNode[]>(
      this.DOMAIN,
      'get',
      'my',
      undefined, 
      { role }   
    ).then(res => {
        this.logger.warn(`[DEBUG-SSO-5] Data-API Response Received. Items: ${Array.isArray(res) ? res.length : 'Not Array'}`);
        return res || [];
    }).catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(`[DEBUG-SSO-ERROR] Data-API Call Failed: ${errorMessage}`);
        return [];
    });
  }

  async getAllMenus(): Promise<MenuNode[]> {
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
    // [수정] Data API가 @Put(':id')을 사용하므로 patch -> put 으로 변경해야 함
    return this.api.request(this.DOMAIN, 'put', String(id), data);
  }

  async deleteMenu(id: number) {
    return this.api.request(this.DOMAIN, 'delete', String(id));
  }

  async updateRolePermissions(
    role: string,
    menuIds: number[],
  ): Promise<void> {
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

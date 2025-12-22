// backend/src/menu/menu.controller.ts
import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/auth.interface';

interface RequestWithUser extends Request {
  user: User;
}

// [수정] DTO 클래스 정의: isVisible 필드 추가
export class CreateMenuDto {
  label: string;
  routerPath?: string;
  parentId?: number;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean; // [추가] 노출 여부 (true/false)
  roles?: string[];
}

export class UpdateMenuDto {
  label?: string;
  routerPath?: string;
  parentId?: number;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean; // [추가] 노출 여부 (true/false)
  roles?: string[];
}

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 1. 내 메뉴 조회 (사이드바용: 권한 및 노출 여부 필터링됨)
  @Get('my')
  async getMyMenus(@Request() req: RequestWithUser) {
    const role = req.user.role ?? 'USER';
    return this.menuService.getMyMenus(role);
  }

  // 2. 전체 메뉴 트리 조회 (관리자용: 모든 메뉴 조회)
  @Get('all')
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }

  // 3. 메뉴 생성
  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto);
  }

  // 4. 메뉴 수정
  @Put(':id')
  async updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.updateMenu(Number(id), updateMenuDto);
  }

  // 5. 메뉴 삭제
  @Delete(':id')
  async deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(Number(id));
  }

  // 6. 권한 목록 조회
  @Get('permissions')
  async getPermissions() {
    return this.menuService.getAllRolePermissions();
  }

  // 7. 권한 저장
  @Post('permissions/:role')
  async savePermissions(
    @Param('role') role: string,
    @Body('menuIds') menuIds: number[],
  ) {
    return this.menuService.updateRolePermissions(role, menuIds);
  }
}

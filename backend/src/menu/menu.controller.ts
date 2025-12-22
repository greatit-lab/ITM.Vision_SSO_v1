// backend/src/menu/menu.controller.ts
import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/auth.interface';

interface RequestWithUser extends Request {
  user: User;
}

// [중요] 기존 경로 'menu' 유지 (사이드바 등 기존 기능 보호)
@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 1. 내 메뉴 조회 (기존 유지)
  @Get('my')
  async getMyMenus(@Request() req: RequestWithUser) {
    const role = req.user.role ?? 'USER';
    return this.menuService.getMyMenus(role);
  }

  // 2. 전체 메뉴 트리 조회 (Frontend의 loadMenuData에서 호출)
  // 기존 'all' 경로 재활용
  @Get('all')
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }

  // 3. [신규] 메뉴 생성
  @Post()
  async createMenu(@Body() createMenuDto: any) {
    return this.menuService.createMenu(createMenuDto);
  }

  // 4. [신규] 메뉴 수정
  @Put(':id')
  async updateMenu(@Param('id') id: string, @Body() updateMenuDto: any) {
    return this.menuService.updateMenu(Number(id), updateMenuDto);
  }

  // 5. [신규] 메뉴 삭제
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

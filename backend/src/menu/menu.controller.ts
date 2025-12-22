// backend/src/menu/menu.controller.ts
import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/auth.interface';

interface RequestWithUser extends Request {
  user: User;
}

// [추가] DTO 클래스 정의
// (Service의 인터페이스와 호환되도록 정의합니다)
export class CreateMenuDto {
  label: string;
  routerPath?: string;
  parentId?: number;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  roles?: string[];
}

export class UpdateMenuDto {
  label?: string;
  routerPath?: string;
  parentId?: number;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  roles?: string[];
}

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 1. 내 메뉴 조회
  @Get('my')
  async getMyMenus(@Request() req: RequestWithUser) {
    const role = req.user.role ?? 'USER';
    return this.menuService.getMyMenus(role);
  }

  // 2. 전체 메뉴 트리 조회
  @Get('all')
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }

  // 3. 메뉴 생성
  // [수정] Body 타입을 any -> CreateMenuDto로 변경
  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto);
  }

  // 4. 메뉴 수정
  // [수정] Body 타입을 any -> UpdateMenuDto로 변경
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
  // menuIds는 숫자 배열이므로 별도 DTO 없이 구체적 타입 명시
  @Post('permissions/:role')
  async savePermissions(
    @Param('role') role: string,
    @Body('menuIds') menuIds: number[],
  ) {
    return this.menuService.updateRolePermissions(role, menuIds);
  }
}

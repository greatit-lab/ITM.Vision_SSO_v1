// backend/src/menu/menu.controller.ts
import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param, Request, Logger } from '@nestjs/common';
import { MenuService, CreateMenuDto, UpdateMenuDto } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

// [ESLint 해결] Request 타입 확장
interface RequestWithUser extends ExpressRequest {
  user?: {
    userId: string;
    role: string;
    [key: string]: any;
  };
}

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  private readonly logger = new Logger(MenuController.name);

  constructor(private readonly menuService: MenuService) {}

  // 1. 내 메뉴 조회 (사이드바용)
  @Get('my')
  async getMyMenus(@Request() req: RequestWithUser) {
    const user = req.user;
    // user가 없거나 role이 없으면 기본값 'USER'
    const role = user?.role || 'USER';
    
    // [디버깅 로그] 1단계: SSO 컨트롤러 진입 확인
    this.logger.warn(`[DEBUG-SSO-1] MenuController.getMyMenus() Called`);
    this.logger.warn(`[DEBUG-SSO-1] Req User: ${JSON.stringify(user)}`);
    this.logger.warn(`[DEBUG-SSO-1] Extracted Role: "${role}"`);
    
    return this.menuService.getMyMenus(role);
  }

  // 2. 전체 메뉴 트리 조회 (관리자용)
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

  // 7. 특정 Role 권한 저장
  @Post('permissions/:role')
  async savePermissions(
    @Param('role') role: string,
    @Body('menuIds') menuIds: number[],
  ) {
    return this.menuService.updateRolePermissions(role, menuIds);
  }
}

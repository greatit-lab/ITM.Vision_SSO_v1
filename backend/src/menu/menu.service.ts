// backend/src/menu/menu.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError, AxiosResponse } from 'axios';

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

export interface CreateMenuDto {
  label: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean;
  roles?: string[];
}

export interface UpdateMenuDto {
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
  private readonly logger = new Logger(MenuService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiHost = this.configService.getOrThrow<string>('DATA_API_HOST');
    this.baseUrl = `${apiHost}/api/menu`;
  }

  // ==========================
  // 공통 유틸
  // ==========================
  private stringifyErrorData(data: unknown): string {
    if (typeof data === 'string') return data;
    if (data instanceof Object) return JSON.stringify(data);
    return 'Unknown Error';
  }

  // ==========================
  // 공통 API 헬퍼
  // ==========================
  private async requestApi<T>(
    method: 'get' | 'post' | 'patch' | 'delete',
    endpoint: string,
    params?: unknown,
    data?: unknown,
  ): Promise<T> {
    const targetPath = endpoint
      ? `${this.baseUrl}/${endpoint}`
      : this.baseUrl;

    try {
      this.logger.debug(`[Requesting ${method.toUpperCase()}] ${targetPath}`);

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: targetPath,
          params,
          data,
        }),
      );

      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Unknown Error';
      let statusCode = 500;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;
        statusCode = axiosError.response?.status ?? 500;
        errorMessage = this.stringifyErrorData(
          axiosError.response?.data,
        );

        this.logger.error(
          `[Data API Error] ${statusCode} - ${targetPath} / ${errorMessage}`,
        );
      }

      throw new InternalServerErrorException(
        `Data API Proxy Error: ${errorMessage}`,
      );
    }
  }

  // ==========================
  // Menu APIs
  // ==========================
  async getMyMenus(role: string): Promise<MenuNode[]> {
    return this.requestApi<MenuNode[]>('get', 'my', { role });
  }

  async getAllMenus(): Promise<MenuNode[]> {
    return this.requestApi<MenuNode[]>('get', 'all');
  }

  async createMenu(data: CreateMenuDto) {
    return this.requestApi('post', '', undefined, data);
  }

  async updateMenu(id: number, data: UpdateMenuDto) {
    return this.requestApi('patch', String(id), undefined, data);
  }

  async deleteMenu(id: number) {
    return this.requestApi('delete', String(id));
  }

  async updateRolePermissions(
    role: string,
    menuIds: number[],
  ): Promise<void> {
    return this.requestApi(
      'post',
      'role-permissions',
      undefined,
      { role, menuIds },
    );
  }

  async getAllRolePermissions() {
    return this.requestApi('get', 'role-permissions');
  }
}

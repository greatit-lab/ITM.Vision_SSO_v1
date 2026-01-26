// backend/src/manual/manual.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// [Type Definition] 데이터 구조 정의 (ESLint 'any' 방지용)
export interface ManualItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  content: string;
  imageUrl?: string;
  sortOrder: number;
  updatedAt: string;
}

@Injectable()
export class ManualService {
  constructor(private readonly httpService: HttpService) {}

  // Data API 주소 (환경변수 사용 권장)
  private readonly DATA_API_URL = 'http://localhost:8081/manual';

  // [GET]
  async findAll(): Promise<ManualItem[]> {
    try {
      // 제네릭을 사용하여 리턴 타입 명시
      const response = await firstValueFrom(
        this.httpService.get<ManualItem[]>(this.DATA_API_URL),
      );
      return response.data;
    } catch (error) {
      // Error 타입 단언 (unsafe member access 방지)
      const err = error as Error;
      console.error('Data API connection error:', err.message);
      // 빈 배열을 반환하거나 에러를 다시 던짐
      throw new InternalServerErrorException('Failed to fetch manuals');
    }
  }

  // [PUT]
  async saveAll(sections: ManualItem[]): Promise<ManualItem[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.put<ManualItem[]>(this.DATA_API_URL, { sections }),
      );
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error('Data API save error:', err.message);
      throw new InternalServerErrorException('Failed to save manuals');
    }
  }
}

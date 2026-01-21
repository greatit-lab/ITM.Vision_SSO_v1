// backend/src/board/board.service.ts

import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';
import { CreatePostDto, CreateCommentDto } from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(private readonly dataApi: DataApiService) {}

  // 1. 팝업 공지 조회 (복구됨)
  async getPopupNotices(): Promise<any> {
    return this.dataApi.request<any>('board', 'get', 'popups');
  }

  // 2. 게시글 목록 조회
  async getPosts(params: any): Promise<any> {
    return this.dataApi.request<any>('board', 'get', '', undefined, params);
  }

  // 3. 게시글 상세 조회
  async getPost(id: number): Promise<any> {
    return this.dataApi.request<any>('board', 'get', String(id));
  }

  // 4. 게시글 작성
  async createPost(data: CreatePostDto): Promise<any> {
    return this.dataApi.request<any>('board', 'post', '', data);
  }

  // 5. 게시글 수정
  async updatePost(id: number, data: any): Promise<any> {
    return this.dataApi.request<any>('board', 'put', String(id), data);
  }

  // 6. 게시글 상태 변경
  async updateStatus(id: number, status: string): Promise<any> {
    return this.dataApi.request<any>('board', 'patch', `${id}/status`, {
      status,
    });
  }

  // 7. 게시글 삭제
  async deletePost(id: number): Promise<any> {
    return this.dataApi.request<any>('board', 'delete', String(id));
  }

  // 8. 댓글 작성
  async createComment(data: CreateCommentDto): Promise<any> {
    return this.dataApi.request<any>('board', 'post', 'comment', data);
  }

  // 9. 댓글 수정 (복구됨)
  async updateComment(id: number, content: string): Promise<any> {
    return this.dataApi.request<any>('board', 'put', `comment/${id}`, {
      content,
    });
  }

  // 10. 댓글 삭제 (복구됨)
  async deleteComment(id: number): Promise<any> {
    return this.dataApi.request<any>('board', 'delete', `comment/${id}`);
  }
}

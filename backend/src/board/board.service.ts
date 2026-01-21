// backend/src/board/board.service.ts
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';

@Injectable()
export class BoardService {
  constructor(private readonly dataApi: DataApiService) {}

  // 게시글 목록 조회
  getPosts(params: any) {
    // request(domain, method, endpoint, data, params)
    return this.dataApi.request<any>('board', 'get', '', undefined, params);
  }

  // 게시글 상세 조회
  getPost(id: number) {
    return this.dataApi.request<any>('board', 'get', String(id));
  }

  // 게시글 작성
  createPost(data: any) {
    return this.dataApi.request<any>('board', 'post', '', data);
  }

  // [추가] 게시글 수정
  updatePost(id: number, data: any) {
    return this.dataApi.request<any>('board', 'put', String(id), data);
  }

  // [추가] 게시글 상태 변경
  updateStatus(id: number, status: string) {
    return this.dataApi.request<any>('board', 'patch', `${id}/status`, { status });
  }

  // 게시글 삭제
  deletePost(id: number) {
    return this.dataApi.request<any>('board', 'delete', String(id));
  }

  // 댓글 작성
  createComment(data: any) {
    return this.dataApi.request<any>('board', 'post', 'comment', data);
  }
}

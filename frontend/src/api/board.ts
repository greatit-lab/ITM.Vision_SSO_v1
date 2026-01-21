// frontend/src/api/board.ts
import http from './http';

export interface BoardPost {
  postId: number;
  category: string;
  title: string;
  content: string;
  authorId: string;
  views: number;
  isSecret: string; // 'Y' | 'N'
  status: string;   // 'OPEN' | 'ANSWERED'
  createdAt: string;
  updatedAt?: string;
  _count?: {
    comments: number;
  };
}

export interface Comment {
  commentId: number;
  postId: number;
  authorId: string;
  content: string;
  parentId?: number;
  createdAt: string;
}

export const boardApi = {
  // 게시글 목록 조회
  getPosts: (params: { page: number; limit: number; category?: string; search?: string }) => {
    return http.get('/board', { params });
  },

  // 게시글 상세 조회
  getPost: (id: number) => {
    return http.get(`/board/${id}`);
  },

  // 게시글 작성
  createPost: (data: { title: string; content: string; authorId: string; category?: string; isSecret?: string }) => {
    return http.post('/board', data);
  },

  // [추가] 게시글 수정
  updatePost: (id: number, data: { title: string; content: string; category?: string; isSecret?: string }) => {
    return http.put(`/board/${id}`, data);
  },

  // [추가] 게시글 상태 변경 (답변완료 처리)
  updateStatus: (id: number, status: string) => {
    return http.patch(`/board/${id}/status`, { status });
  },

  // 게시글 삭제
  deletePost: (id: number) => {
    return http.delete(`/board/${id}`);
  },

  // 댓글 작성
  createComment: (data: { postId: number; authorId: string; content: string; parentId?: number }) => {
    return http.post('/board/comment', data);
  }
};

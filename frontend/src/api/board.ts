// frontend/src/api/board.ts
import http from "./http";

export interface BoardPost {
  postId: number;
  category: string;
  title: string;
  content: string;
  authorId: string;
  views: number;
  isSecret: string;
  isPopup?: string;
  status: string;
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
  getPosts: (params: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }) => {
    return http.get("/board", { params });
  },

  // 팝업 공지 조회
  getPopups: () => {
    return http.get("/board/popups");
  },

  // 게시글 상세 조회
  getPost: (id: number) => {
    return http.get(`/board/${id}`);
  },

  // 게시글 작성
  createPost: (data: {
    title: string;
    content: string;
    authorId: string;
    category?: string;
    isSecret?: string;
    isPopup?: string;
  }) => {
    return http.post("/board", data);
  },

  // 게시글 수정
  updatePost: (
    id: number,
    data: {
      title: string;
      content: string;
      category?: string;
      isSecret?: string;
      isPopup?: string;
    },
  ) => {
    return http.put(`/board/${id}`, data);
  },

  // 게시글 상태 변경
  updateStatus: (id: number, status: string) => {
    return http.put(`/board/${id}/status`, { status });
  },

  // 게시글 삭제
  deletePost: (id: number) => {
    return http.delete(`/board/${id}`);
  },

  // 댓글 작성 (상태 변경 옵션 추가)
  createComment: (data: {
    postId: number;
    authorId: string;
    content: string;
    parentId?: number;
    status?: string; // [추가] 게시글 상태 동시 변경용
  }) => {
    return http.post("/board/comment", data);
  },

  // 댓글 수정
  updateComment(commentId: number, content: string) {
    return http.put(`/board/comment/${commentId}`, { content });
  },

  // 댓글 삭제
  deleteComment(commentId: number) {
    return http.delete(`/board/comment/${commentId}`);
  },
};

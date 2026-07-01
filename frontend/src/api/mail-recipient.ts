// frontend/src/api/mail-recipient.ts
import http from "./http";

export interface MailRecipient {
  id: number;
  loginId: string;
  recipientEmail: string;
  recipientName?: string;
  recipientType: string; // SYSTEM | USER
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mailRecipientApi = {
  // 전체 수신자 목록 (Admin/Manager)
  getAll: () => {
    return http.get("/mail-recipient");
  },

  // 시스템 수신자 목록 (읽기 전용)
  getSystem: () => {
    return http.get("/mail-recipient/system");
  },

  // 내가 등록한 수신자 목록
  getMy: () => {
    return http.get("/mail-recipient/my");
  },

  // 수신자 추가
  create: (data: {
    recipientEmail: string;
    recipientName?: string;
    recipientType?: string;
  }) => {
    return http.post("/mail-recipient", data);
  },

  // 수신자 수정
  update: (
    id: number,
    data: {
      recipientEmail?: string;
      recipientName?: string;
      isActive?: boolean;
    },
  ) => {
    return http.put(`/mail-recipient/${id}`, data);
  },

  // 수신자 삭제
  remove: (id: number) => {
    return http.delete(`/mail-recipient/${id}`);
  },
};

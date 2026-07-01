// backend/src/board/board.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { DataApiService } from '../common/data-api.service';
import { KnoxMailService } from '../knox/knox-mail.service';
import { MailRecipientService } from '../mail-recipient/mail-recipient.service';
import { CreatePostDto, CreateCommentDto } from './dto/board.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BoardService {
  private readonly DOMAIN = 'board';
  private readonly templatesDir = path.join(
    __dirname,
    '..',
    'knox',
    'email-templates',
  );
  
  constructor(
    private readonly dataApi: DataApiService,
    private readonly knoxMailService: KnoxMailService,
    private readonly mailrecipientService: MailRecipientService,
  ) {}

  // 1. 팝업 공지 조회
  async getPopupNotices(): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'get', 'popups');
  }

  // 2. 게시글 목록 조회
  async getPosts(params: any): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'get', '', undefined, params);
  }

  // 3. 게시글 상세 조회
  async getPost(id: number): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'get', String(id));
  }

  // 4. 게시글 작성 (메일 발송 연동)
  async createPost(data: CreatePostDto): Promise<any> {
    const post = await this.dateApi.request<any>(this.DOMAIN, 'post', '', data);

    this.sendPostNotificationMail(post, data).catch((err) => {
      console.error(
        '[BoardService] Failed to send post notification email:',
        err,
      );
    });

    return post;
  }

  // 5. 게시글 수정
  async updatePost(id: number, data: any): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'put', String(id), data);
  }

  // 6. 게시글 상태 변경
  async updateStatus(id: number, status: string): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'patch', `${id}/status`, {
      status,
    });
  }

  // 7. 게시글 삭제
  async deletePost(id: number): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'delete', String(id));
  }

  // 8. 댓글 작성 (메일 발송 연동)
  async createComment(data: CreateCommentDto): Promise<any> {
    const comment = await this.dateApi.request<any>(
        this.DOMAIN,
        'post',
        '',
        data,
    );

    this.sendPostNotificationMail(comment, data).catch((err) => {
      console.error(
        '[BoardService] Failed to send reply notification email:',
        err,
      );
    });

    return comment;
  }


    
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

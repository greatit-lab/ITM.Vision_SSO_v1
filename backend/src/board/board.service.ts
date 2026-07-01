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

  // 9. 댓글 수정
  async updateComment(id: number, content: string): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'put', `comment/${id}`, {
      content,
    });
  }

  // 10. 댓글 삭제
  async deleteComment(id: number): Promise<any> {
    return this.dataApi.request<any>(this.DOMAIN, 'delete', `comment/${id}`);
  }

  // ==========================================
  // [메일 발송] 게시글 등록 알림
  // ==========================================
  private async sendPostNotificationMail(
    post: any,
    data: CreatePostDto,
  ): Promise<void> {
    const recipients =
      await this.mailRecipientService.getActiveRecipientEmails();
    if (!recipients || recipients.length ===0) return;

    const html = this.renderTemplate('post-notification.html', {
      category: data.category || 'QNA',
      title: data.title,
      authorName: data.authorId,
      createdAt: new Data().toLocaleString('ko-KR'),
      link: `https://localhost:8080/board/${post.postId || post.id}`,
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: `[I:Vision] 새로운 게시글이 등록되었습니다 (${data.category || 'QNA'})`,
      content: html,
    });
  }

  // ==========================================
  // [메일 발송] 답변 알림
  // ==========================================
  private async sendReplyNotificationMail(
    comment: any,
    data: CreateCommentDto,
  ): Promise<void> {
    const post = await this.getPost(data.postId);
    if (!post || post.authorId === data.authorId) return;

    const recipients: string[] = [post.authorId];

    const systemRecipients =
      await this.mailRecipientService.getActiveRecipientEmails('SYSTEM');
    if (systemRecipients) {
      recipients.push(...systemRecipients);
    }
    const html = this.renderTemplate('reply-notification.html', {
      postTitle: post.title,
      replyContent: data. content,
      replyAuthorName: data.authorId,
      createdAt: new Data().toLocaleString('ko-KR'),
      link: `https://localhost:8080/board/${post.postId || post.id}`,
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: `[I:Vision] "${post.title}" 게시글에 답변이 달렸습니다`,
      content: html,
    });
  }

  // ==========================================
  // [공통] 이메일 템플릿 렌더링
  // ==========================================
  private renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    try {
      const templatePath = path.join(this.templatesDir, templateName);
      let html = fs.readFileSync(templatePath, 'utf-8');

      for (const [key, value] of Object.entries(variables)) {
        html = html.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      return html;
    } catch (error) {
      console.error(
        `[BoardService] Failed to render template ${templateName}:`,
        error,
      );
      return `<p>새로운 알림이 있습니다. I:Vision에서 확인해 주세요.</p>`;
    }
  }
}

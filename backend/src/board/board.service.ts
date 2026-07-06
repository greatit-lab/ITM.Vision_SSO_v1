// backend/src/board/board.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataApiService } from '../common/data-api.service';
import { KnoxMailService } from '../knox/knox-mail.service';
import { MailRecipientService } from '../mail-recipient/mail-recipient.service';
import { CreatePostDto, CreateCommentDto } from './dto/board.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
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
    private readonly mailRecipientService: MailRecipientService,
    private readonly configService: ConfigService,
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

  // 4. 게시글 작성
  async createPost(data: CreatePostDto): Promise<any> {
    const post = await this.dataApi.request<any>(this.DOMAIN, 'post', '', data);

    this.sendPostNotificationMail(post, data).catch((error) => {
      this.logger.error(
        `[Board Mail] Failed to send new post notification mail: ${
          error instanceof Error ? error.message : String(error)
        }`,
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

  // 8. 댓글 작성
  async createComment(data: CreateCommentDto): Promise<any> {
    const comment = await this.dataApi.request<any>(
      this.DOMAIN,
      'post',
      'comment',
      data,
    );

    this.sendReplyNotificationMail(comment, data).catch((error) => {
      this.logger.error(
        `[Board Mail] Failed to send reply notification mail: ${
          error instanceof Error ? error.message : String(error)
        }`,
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
  // - 모든 카테고리 대상
  // - Admin / Manager 권한자 대상
  // ==========================================
  private async sendPostNotificationMail(
    post: any,
    data: CreatePostDto,
  ): Promise<void> {
    const postId = this.resolvePostId(post);
    const recipients =
      await this.mailRecipientService.getBoardAdminManagerRecipientEmails();

    if (!recipients || recipients.length === 0) {
      this.logger.warn(
        `[Board Mail] Skip new post notification. No Admin/Manager recipients. postId=${postId}`,
      );
      return;
    }

    const category = this.toText(data.category || post?.category || 'QNA');
    const title = this.toText(data.title || post?.title || '');
    const authorName = this.toText(data.authorId || post?.authorId || '');
    const createdAt = this.formatDateTime(post?.createdAt);
    const link = this.buildBoardLink(postId);

    const html = this.renderTemplate('post-notification.html', {
      category,
      title,
      authorName,
      createdAt,
      link,
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: `[I:Vision] 새로운 게시글이 등록되었습니다 (${category})`,
      content: html,
    });

    this.logger.log(
      `[Board Mail] New post notification sent. postId=${postId}, recipients=${recipients.length}`,
    );
  }

  // ==========================================
  // [메일 발송] 답변 / 댓글 알림
  // - 원 게시글 작성자에게 발송
  // - 작성자가 본인 글에 댓글을 단 경우는 제외
  // ==========================================
  private async sendReplyNotificationMail(
    comment: any,
    data: CreateCommentDto,
  ): Promise<void> {
    const postId = Number(data.postId);
    const post = await this.getPost(postId);

    if (!post) {
      this.logger.warn(
        `[Board Mail] Skip reply notification. Post not found. postId=${postId}`,
      );
      return;
    }

    const postAuthorId = this.toText(post.authorId || post.author?.loginId);
    const replyAuthorId = this.toText(data.authorId || comment?.authorId);

    if (!postAuthorId) {
      this.logger.warn(
        `[Board Mail] Skip reply notification. Post author is empty. postId=${postId}`,
      );
      return;
    }

    if (postAuthorId === replyAuthorId) {
      this.logger.log(
        `[Board Mail] Skip reply notification. Reply author is same as post author. postId=${postId}`,
      );
      return;
    }

    const recipients = this.unique([postAuthorId]);

    const html = this.renderTemplate('reply-notification.html', {
      postTitle: this.toText(post.title),
      replyContent: this.toText(data.content || comment?.content),
      replyAuthorName: replyAuthorId,
      createdAt: this.formatDateTime(comment?.createdAt),
      link: this.buildBoardLink(postId),
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: `[I:Vision] "${this.toText(post.title)}" 게시글에 답변이 달렸습니다`,
      content: html,
    });

    this.logger.log(
      `[Board Mail] Reply notification sent. postId=${postId}, recipient=${postAuthorId}`,
    );
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
        html = html.replace(new RegExp(`{${key}}`, 'g'), this.escapeHtml(value));
      }

      return html;
    } catch (error) {
      this.logger.error(
        `[Board Mail] Failed to render template ${templateName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return `<p>새로운 알림이 있습니다. I:Vision에서 확인해 주세요.</p>`;
    }
  }

  private resolvePostId(post: any): number {
    const value = post?.postId ?? post?.id ?? post?.data?.postId ?? post?.data?.id;
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private buildBoardLink(postId: number): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8080';

    try {
      const url = new URL(frontendUrl);
      return `${url.origin}/support/qna/${postId}`;
    } catch {
      return `/support/qna/${postId}`;
    }
  }

  private formatDateTime(value?: string | Date): string {
    const date = value ? new Date(value) : new Date();

    if (Number.isNaN(date.getTime())) {
      return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    }

    return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  }

  private toText(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private unique(values: string[]): string[] {
    return Array.from(
      new Set(
        values
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    );
  }
}

// backend/src/board/board.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    // authorName은 알림 메일 표시용일 뿐이므로 itm-data-api에는 전달하지 않음
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorName, ...dataApiPayload } = data;
    const post = await this.dataApi.request<any>(
      this.DOMAIN,
      'post',
      '',
      dataApiPayload,
    );

    this.sendPostNotificationMail(post, data).catch((error: unknown) => {
      this.logger.error(
        `[Board Mail] Failed to send new post notification mail: ${this.getErrorMessage(
          error,
        )}`,
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
    // authorRole은 알림 메일 표시용일 뿐이므로 itm-data-api에는 전달하지 않음
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorRole, ...dataApiPayload } = data;
    const comment = await this.dataApi.request<any>(
      this.DOMAIN,
      'post',
      'comment',
      dataApiPayload,
    );

    this.sendReplyNotificationMail(comment, data).catch((error: unknown) => {
      this.logger.error(
        `[Board Mail] Failed to send reply notification mail: ${this.getErrorMessage(
          error,
        )}`,
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
  // - NOTICE 카테고리는 공지용이므로 제외
  // - Admin / Manager 권한자 대상
  // ==========================================
  private async sendPostNotificationMail(
    post: unknown,
    data: CreatePostDto,
  ): Promise<void> {
    const postId = this.resolvePostId(post);

    const postCategoryRaw = this.readObjectValue(post, 'category');
    const category = this.toText(
      data.category || postCategoryRaw || 'QNA',
    ).toUpperCase();

    if (category === 'NOTICE') {
      this.logger.log(
        `[Board Mail] Skip new post notification. NOTICE category. postId=${postId}`,
      );
      return;
    }

    const recipients =
      await this.mailRecipientService.getBoardAdminManagerRecipientEmails();

    if (!recipients || recipients.length === 0) {
      this.logger.warn(
        `[Board Mail] Skip new post notification. No Admin/Manager recipients. postId=${postId}`,
      );
      return;
    }

    const postTitle = this.readObjectValue(post, 'title');
    const postAuthorId = this.readObjectValue(post, 'authorId');
    const postCreatedAt = this.readObjectValue(post, 'createdAt');
    const postContent = this.readObjectValue(post, 'content');

    const title = this.toText(data.title || postTitle || '');
    const authorId = this.toText(data.authorId || postAuthorId || '');
    const authorDisplayName = this.toText(data.authorName || '');
    const authorName = authorDisplayName
      ? `${authorDisplayName}(${authorId})`
      : authorId;
    const createdAt = this.formatDateTime(postCreatedAt);
    const link = this.buildBoardLink(postId);
    const frontendOrigin = this.getFrontendOrigin();
    const contentHtml = this.sanitizeContentHtml(
      this.toText(data.content || postContent || ''),
    );

    const categoryBadgeColors = this.getCategoryBadgeColors(category);

    const html = this.renderTemplate('post-notification.html', {
      category,
      __categoryBadgeTextColor__: categoryBadgeColors.text,
      __categoryBadgeBgColor__: categoryBadgeColors.bg,
      __categoryBadgeBorderColor__: categoryBadgeColors.border,
      title,
      authorName,
      authorInitial: authorId.charAt(0).toUpperCase() || '?',
      createdAt,
      contentHtml,
      link,
      logoIconUrl: `${frontendOrigin}/mail/logo-icon.png`,
      logoTextUrl: `${frontendOrigin}/mail/logo-text.png`,
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
    comment: unknown,
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

    const postAuthor = this.readObjectValue(post, 'author');
    const postAuthorId = this.toText(
      this.readObjectValue(post, 'authorId') ||
        this.readObjectValue(postAuthor, 'loginId'),
    );

    const commentAuthorId = this.readObjectValue(comment, 'authorId');
    const replyAuthorId = this.toText(data.authorId || commentAuthorId);

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

    const postTitle = this.toText(this.readObjectValue(post, 'title'));
    const postCategoryRaw = this.readObjectValue(post, 'category');
    const category = this.toText(postCategoryRaw || 'QNA').toUpperCase();
    const categoryBadgeColors = this.getCategoryBadgeColors(category);
    const commentContent = this.readObjectValue(comment, 'content');
    const commentCreatedAt = this.readObjectValue(comment, 'createdAt');
    const isAnswered = data.status === 'ANSWERED';
    const frontendOrigin = this.getFrontendOrigin();
    const contentHtml = this.plainTextToHtml(
      this.toText(data.content || commentContent || ''),
    );

    const replyAuthorRole = this.toText(data.authorRole || '').toUpperCase();
    const isAdmin = replyAuthorRole === 'ADMIN';
    const isManager = replyAuthorRole === 'MANAGER';
    const authorName = isAdmin || isManager ? replyAuthorRole : replyAuthorId;
    const authorInitial = isAdmin
      ? 'A'
      : isManager
        ? 'M'
        : replyAuthorId.charAt(0).toUpperCase() || '?';
    const authorAvatarColor = isAdmin
      ? '#dc2626'
      : isManager
        ? '#7c3aed'
        : '#0f9d58';

    const html = this.renderTemplate('reply-notification.html', {
      category,
      __categoryBadgeTextColor__: categoryBadgeColors.text,
      __categoryBadgeBgColor__: categoryBadgeColors.bg,
      __categoryBadgeBorderColor__: categoryBadgeColors.border,
      statusBadgeText: isAnswered ? '답변 완료' : '새 답변',
      __statusBadgeColor__: isAnswered ? '#0f9d58' : '#f4b400',
      postTitle,
      contentHtml,
      authorName,
      authorInitial,
      __authorAvatarColor__: authorAvatarColor,
      createdAt: this.formatDateTime(commentCreatedAt),
      link: this.buildBoardLink(postId),
      logoIconUrl: `${frontendOrigin}/mail/logo-icon.png`,
      logoTextUrl: `${frontendOrigin}/mail/logo-text.png`,
    });

    await this.knoxMailService.sendMail({
      recipients,
      subject: isAnswered
        ? `[I:Vision] "${postTitle}" 게시글이 답변 완료 처리되었습니다`
        : `[I:Vision] "${postTitle}" 게시글에 답변이 달렸습니다`,
      content: html,
    });

    this.logger.log(
      `[Board Mail] Reply notification sent. postId=${postId}, recipient=${postAuthorId}, status=${data.status || 'OPEN'}`,
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
        const isBraceless = key.startsWith('__') && key.endsWith('__');
        const pattern = isBraceless ? key : `{${key}}`;
        // "Html" 접미사 키는 이미 렌더링된 HTML로 간주하여 이스케이프하지 않음
        const replacement = key.endsWith('Html')
          ? value
          : this.escapeHtml(value);
        html = html.replace(new RegExp(pattern, 'g'), () => replacement);
      }

      return html;
    } catch (error: unknown) {
      this.logger.error(
        `[Board Mail] Failed to render template ${templateName}: ${this.getErrorMessage(
          error,
        )}`,
      );

      return '<p>새로운 알림이 있습니다. I:Vision에서 확인해 주세요.</p>';
    }
  }

  private resolvePostId(post: unknown): number {
    const directPostId = this.readObjectValue(post, 'postId');
    const directId = this.readObjectValue(post, 'id');

    const data = this.readObjectValue(post, 'data');
    const nestedPostId = this.readObjectValue(data, 'postId');
    const nestedId = this.readObjectValue(data, 'id');

    const value = directPostId ?? directId ?? nestedPostId ?? nestedId;
    const parsed = this.toNumber(value);

    return parsed ?? 0;
  }

  private buildBoardLink(postId: number): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://localhost:8080';

    try {
      const url = new URL(frontendUrl);
      return `${url.origin}/support/qna/${postId}`;
    } catch {
      return `/support/qna/${postId}`;
    }
  }

  private getFrontendOrigin(): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://localhost:8080';

    try {
      return new URL(frontendUrl).origin;
    } catch {
      return frontendUrl;
    }
  }

  // QnaDetailView.vue의 getCategoryColor()와 동일한 색상 매핑
  // (Tailwind text-*-600 / bg-*-50 / border-*-100 실제 HEX 값)
  private getCategoryBadgeColors(category: string): {
    text: string;
    bg: string;
    border: string;
  } {
    switch (category) {
      case 'NOTICE':
        return { text: '#e11d48', bg: '#fff1f2', border: '#ffe4e6' };
      case 'BUG':
        return { text: '#d97706', bg: '#fffbeb', border: '#fef3c7' };
      case 'IDEA':
        return { text: '#0d9488', bg: '#f0fdfa', border: '#ccfbf1' };
      default:
        return { text: '#4f46e5', bg: '#eef2ff', border: '#e0e7ff' };
    }
  }

  private formatDateTime(value?: unknown): string {
    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      date = new Date();
    }

    if (Number.isNaN(date.getTime())) {
      date = new Date();
    }

    return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  }

  // 게시글 content(HTML)를 메일 본문에 그대로 삽입하기 전, 스크립트/이벤트 핸들러만 제거
  private sanitizeContentHtml(contentHtml: string): string {
    const sanitized = contentHtml
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '')
      .trim();

    return sanitized || '<p style="color:#999">(내용 없음)</p>';
  }

  // 답글 content(순수 텍스트, 개행문자 \n 포함)를 메일 본문에 삽입하기 전 HTML로 안전 변환
  private plainTextToHtml(plainText: string): string {
    const trimmed = plainText.trim();

    if (!trimmed) {
      return '<p style="color:#999">(내용 없음)</p>';
    }

    return this.escapeHtml(trimmed).replace(/\n/g, '<br>');
  }

  private toText(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return String(value);
    }

    if (value instanceof Date) {
      return this.formatDateTime(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.toText(item)).join(', ');
    }

    if (this.isRecord(value)) {
      try {
        return JSON.stringify(value);
      } catch {
        return '';
      }
    }

    return '';
  }

  private toNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  }

  private readObjectValue(
    source: unknown,
    key: string,
  ): string | number | boolean | Date | Record<string, unknown> | undefined {
    if (!this.isRecord(source)) {
      return undefined;
    }

    const value = source[key];

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date ||
      this.isRecord(value)
    ) {
      return value;
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (
      typeof error === 'number' ||
      typeof error === 'boolean' ||
      typeof error === 'bigint'
    ) {
      return String(error);
    }

    if (this.isRecord(error)) {
      try {
        return JSON.stringify(error);
      } catch {
        return 'Unknown object error';
      }
    }

    return 'Unknown error';
  }

  private unique(values: string[]): string[] {
    return Array.from(
      new Set(
        values.map((value) => value.trim()).filter((value) => value.length > 0),
      ),
    );
  }
}

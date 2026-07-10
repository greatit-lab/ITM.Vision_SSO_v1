// backend/src/knox/knox-mail.service.ts
import * as dns from 'dns';
import * as os from 'os';
import * as https from 'https';
import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMailDto, KnoxMailResponse } from './dto/knox-mail.dto';

interface KnoxMailPayload {
  subject: string;
  contents: string;
  contentType: 'HTML';
  docSecuType: 'PERSONAL';
  sender: {
    emailAddress: string;
  };
  recipients: {
    emailAddress: string;
    recipientType: 'TO';
  }[];
}

@Injectable()
export class KnoxMailService {
  private readonly logger = new Logger(KnoxMailService.name);
  private readonly apiHost: string;
  private readonly accountId: string;
  private readonly accessToken: string;
  private readonly senderEmail: string;
  private readonly httpsAgent: https.Agent;

  constructor(private readonly configService: ConfigService) {
    this.apiHost = this.configService.get<string>('KNOX_API_HOST') || '';
    this.accountId = this.configService.get<string>('KNOX_ACCOUNT_ID') || '';
    this.accessToken =
      this.configService.get<string>('KNOX_ACCESS_TOKEN') || '';

    // [디버깅 코드] 실제 로드된 토큰의 앞자리 확인
    this.logger.warn(
      `[DEBUG-TOKEN] Loaded Token Prefix: ${this.accessToken.substring(0, 5)}...`,
    );

    this.senderEmail =
      this.configService.get<string>('KNOX_SENDER_EMAIL') || '';

    const rejectUnauthorized =
      this.configService.get<string>('KNOX_TLS_REJECT_UNAUTHORIZED') !==
      'false';

    this.httpsAgent = new https.Agent({
      keepAlive: true,
      rejectUnauthorized,
    });

    this.logger.log(
      `[KnoxMailService] Initialized | Host=${this.apiHost} | Account=${this.accountId} | Sender=${this.senderEmail} | TLS_REJECT_UNAUTHORIZED=${rejectUnauthorized}`,
    );
  }

  async sendMail(dto: SendMailDto): Promise<KnoxMailResponse | null> {
    if (!this.isConfigured()) {
      this.logger.error(
        '[KnoxMailService] Knox mail configuration is incomplete. Check KNOX_API_HOST, KNOX_ACCOUNT_ID, KNOX_ACCESS_TOKEN, KNOX_SENDER_EMAIL.',
      );
      return null;
    }

    const recipients = this.unique(
      dto.recipients
        .map((recipient) => this.resolveEmailAddress(recipient))
        .filter((recipient) => recipient.length > 0),
    );

    if (recipients.length === 0) {
      this.logger.warn('[KnoxMailService] No valid recipients. Skip sendMail.');
      return null;
    }

    const mailPayload: KnoxMailPayload = {
      subject: dto.subject,
      contents: dto.content,
      contentType: 'HTML',
      docSecuType: 'PERSONAL',
      sender: {
        emailAddress: this.senderEmail,
      },
      recipients: recipients.map((recipient) => ({
        emailAddress: recipient,
        recipientType: 'TO',
      })),
    };

    const mailJson = JSON.stringify(mailPayload);
    const formData = new FormData();
    formData.append('mail', mailJson);

    const userId = this.senderEmail.split('@')[0];
    const targetUrl = `${this.apiHost}/mail/api/v2.0/mails/send?userId=${userId}`;

    try {
      this.logger.log(
        `[KnoxMailService] Sending mail to ${recipients.length} recipient(s) | Subject: ${dto.subject}`,
      );

      this.logRequestSummary(targetUrl, mailJson);

      const response = await axios.post<unknown>(targetUrl, formData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'System-ID': this.accountId,
          'User-Agent': 'I:Vision/1.0',
        },
        httpsAgent: this.httpsAgent,
        timeout: 30000,
        proxy: false,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: () => true,
      });

      const responseData: unknown = response.data;

      if (response.status < 200 || response.status >= 300) {
        this.logger.error(
          `[KnoxMailService] Knox API Error | Status: ${response.status} | Data: ${this.toLogText(
            responseData,
          )}`,
        );
        return null;
      }

      const result = this.parseKnoxMailResponse(responseData);

      if (!result) {
        this.logger.warn(
          `[KnoxMailService] Mail request succeeded but response parse failed. Raw=${this.toLogText(
            responseData,
          )}`,
        );
        return null;
      }

      this.logger.log(
        `[KnoxMailService] Mail sent successfully | mailId: ${result.mailId}`,
      );

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `[KnoxMailService] Knox API Request Failed | ${this.getErrorMessage(
          error,
        )}`,
      );

      return null;
    }
  }

  private isConfigured(): boolean {
    return Boolean(
      this.apiHost && this.accountId && this.accessToken && this.senderEmail,
    );
  }

  private resolveEmailAddress(emailOrId: string): string {
    const value = emailOrId.trim();

    if (!value) {
      return '';
    }

    if (this.isEmailAddress(value)) {
      return value;
    }

    const senderDomain = this.getSenderDomain();

    if (!senderDomain) {
      return value;
    }

    return `${value}@${senderDomain}`;
  }

  private isEmailAddress(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private getSenderDomain(): string {
    const parts = this.senderEmail.split('@');

    if (parts.length === 2 && parts[1]) {
      return parts[1];
    }

    return process.env.NODE_ENV === 'production'
      ? 'samsung.com'
      : 'stage.samsung.com';
  }

  private logRequestSummary(targetUrl: string, mailJson: string): void {
    this.logger.log('[KnoxMailService] === Request Summary ===');
    this.logger.log(`  URL: ${targetUrl}`);
    this.logger.log(`  Source IP: ${this.getLocalIP()}`);

    try {
      const parsedUrl = new URL(targetUrl);

      dns.lookup(parsedUrl.hostname, (err, address) => {
        if (err) {
          this.logger.warn(`  Destination DNS Lookup Failed: ${err.message}`);
          return;
        }

        this.logger.log(`  Destination IP: ${address}`);
      });
    } catch {
      this.logger.warn('[KnoxMailService] Failed to parse target URL.');
    }

    this.logger.log('  Destination Port: 443 (HTTPS)');
    this.logger.log(`  System-ID: ${this.accountId}`);
    this.logger.log('  Content-Type: multipart/form-data');
    this.logger.log(
      `  Payload Size: ${Buffer.byteLength(mailJson, 'utf8')} bytes`,
    );
    this.logger.log('========================================');
  }

  private parseKnoxMailResponse(
    responseData: unknown,
  ): KnoxMailResponse | null {
    const parsed = this.parseResponseData(responseData);

    if (!this.isRecord(parsed)) {
      return null;
    }

    const result = this.readString(parsed, 'result');
    const mailId = this.readString(parsed, 'mailId');

    if (!result && !mailId) {
      return null;
    }

    return {
      result,
      mailId,
    };
  }

  private parseResponseData(responseData: unknown): unknown {
    if (typeof responseData !== 'string') {
      return responseData;
    }

    const trimmed = responseData.trim();

    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return responseData;
    }
  }

  private readString(source: Record<string, unknown>, key: string): string {
    const value = source[key];

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '';
  }

  private getLocalIP(): string {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      const networkList = interfaces[name] || [];

      for (const iface of networkList) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }

    return 'unknown';
  }

  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const parts: string[] = [];

      if (error.code) {
        parts.push(`code=${error.code}`);
      }

      parts.push(`message=${error.message}`);

      if (error.response) {
        parts.push(`status=${error.response.status}`);
        parts.push(`response=${this.toLogText(error.response.data)}`);
      }

      const causeMessage = this.getCauseMessage(error);
      if (causeMessage) {
        parts.push(`cause=${causeMessage}`);
      }

      return parts.join(' | ');
    }

    if (error instanceof Error) {
      const causeMessage = this.getCauseMessage(error);
      return causeMessage
        ? `${error.message} | cause=${causeMessage}`
        : error.message;
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

    return this.toLogText(error);
  }

  private getCauseMessage(error: unknown): string {
    if (!this.isRecord(error)) {
      return '';
    }

    const cause = error.cause;

    if (cause instanceof Error) {
      return cause.message;
    }

    if (typeof cause === 'string') {
      return cause;
    }

    if (
      typeof cause === 'number' ||
      typeof cause === 'boolean' ||
      typeof cause === 'bigint'
    ) {
      return String(cause);
    }

    if (this.isRecord(cause)) {
      return this.toLogText(cause);
    }

    return '';
  }

  private toLogText(value: unknown): string {
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

    try {
      return JSON.stringify(value);
    } catch {
      return 'Unknown object';
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private unique(values: string[]): string[] {
    return Array.from(
      new Set(
        values.map((value) => value.trim()).filter((value) => value.length > 0),
      ),
    );
  }
}

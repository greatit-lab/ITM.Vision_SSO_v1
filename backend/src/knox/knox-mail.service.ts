// backend/src/knox/knox-mail.service.ts
import * as dns from 'dns';
import * as os from 'os';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { SendMailDto, KnoxMailResponse } from './dto/knox-mail.dto';

@Injectable()
export class KnoxMailService {
  private readonly logger = new Logger(KnoxMailService.name);
  private readonly apiHost: string;
  private readonly accountId: string;
  private readonly accessToken: string;
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiHost = this.configService.get<string>('KNOX_API_HOST') || '';
    this.accountId = this.configService.get<string>('KNOX_ACCOUNT_ID') || '';
    this.accessToken =
      this.configService.get<string>('KNOX_ACCESS_TOKEN') || '';
    this.senderEmail =
      this.configService.get<string>('KNOX_SENDER_EMAIL') || '';

    this.logger.log(
      `[KnoxMailService] Initialized | Host=${this.apiHost} | Account=${this.accountId} | Sender=${this.senderEmail}`,
    );
  }

  async sendMail(dto: SendMailDto): Promise<KnoxMailResponse | null> {
    try {
      this.logger.log(
        `[KnoxMailService] Sending mail to: ${dto.recipients.join(', ')} | Subject: ${dto.subject}`,
      );

      const formData = new FormData();

      const mailPayload = {
        subject: dto.subject,
        contents: dto.content,
        contentType: 'HTML',
        docSecuType: 'PERSONAL',
        sender: {
          emailAddress: this.senderEmail,
        },
        recipients: dto.recipients.map((r) => ({
          emailAddress: this.resolveEmailAddress(r),
          recipientType: 'TO',
        })),
      };

      formData.append('mail', JSON.stringify(mailPayload));

      this.logger.log(
        `[KnoxMailService] Content-Type: ${formData.getHeaders()['content-type']}`,
      );

      // userId 는 이메일 주소가 아닌 유저명만 사용
      const userId = this.senderEmail.split('@')[0];
      const targetUrl = `${this.apiHost}/mail/api/v2.0/mails/send?userId=${userId}`;

      // 상세 로그 출력
      this.logger.log(`[KnoxMailService] === Detailed Request Info ===`);
      this.logger.log(`  URL: ${targetUrl}`);
      this.logger.log(`  Source IP: ${this.getLocalIP()}`);

      // 목적지 IP 확인 (비동기)
      const parsedUrl = new URL(targetUrl);
      dns.lookup(parsedUrl.hostname, (err, address) => {
        if (!err) {
          this.logger.log(`  Destination IP: ${address}`);
        }
      });

      this.logger.log(`  Destination Port: 443 (HTTPS)`);
      this.logger.log(`  Headers:`);
      this.logger.log(
        `    Authorization: Bearer ${this.accessToken.substring(0, 10)}...`,
      );
      this.logger.log(`    System-ID: ${this.accountId}`);
      this.logger.log(
        `    Content-Type: ${formData.getHeaders()['content-type']}`,
      );
      this.logger.log(`    User-Agent: I:Vision/1.0`);
      this.logger.log(`  Body Size: ${formData.getLengthSync()} bytes`);
      this.logger.log(
        `  Body Preview: ${JSON.stringify(mailPayload).substring(0, 200)}...`,
      );
      this.logger.log(`========================================`);

      // node-fetch 로 요청 (form-data 올바르게 직렬화)
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${this.accessToken}`,
          'System-ID': this.accountId,
          'User-Agent': 'I:Vision/1.0',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(
          `[KnoxMailService] Knox API Error | Status: ${response.status} | Data: ${errorData}`,
        );
        return null;
      }

      const result = (await response.json()) as KnoxMailResponse;
      this.logger.log(
        `[KnoxMailService] Mail sent successfully | mailId: ${result.mailId}`,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[KnoxMailService] Knox API Error | ${errorMessage}`);
      return null;
    }
  }

  private resolveEmailAddress(emailOrId: string): string {
    if (emailOrId.includes('@samsung.com')) {
      return emailOrId;
    }

    // 개발모드: @stage.samsung.com, 운영모드: @samsung.com
    const domain =
      process.env.NODE_ENV === 'production'
        ? 'samsung.com'
        : 'stage.samsung.com';

    return `${emailOrId}@${domain}`;
  }

  private getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'unknown';
  }
}

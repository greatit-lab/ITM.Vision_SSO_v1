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
    this.senderEamil =
      this.configService.get<string>('KNOX_SENDER_EMAIL') || '';
    
    this.logger.log(
      `[KnoxMailService] Initialized | Host=${this.apiHost} | Account-${this.accountId} | Sender=${this.senderEmail}`,
    );
  }

  async sendMail(dto: SendMailDto): Promise<KnoxMailResponse | null> {
    try {
      this.logger.log(
        `[KnoxMailService] Sending mail to: ${dto.recipients.join(', ')} | Subject: ${dto.subject}`,
      );

      const formData = new FromData();

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
      this.logger.log
        
  

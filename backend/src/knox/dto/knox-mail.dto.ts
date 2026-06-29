// backend/src/knox/dto/knox-mail.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ArrayNotEmpty } from 'class-validator';

export class SendMailDto {
  @ArrayNotEmpty()
  recipients!: string[];

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  recipientName?: string;
}

export class KnoxMailResponse {
  result!: string;
  mailId!: string;
}

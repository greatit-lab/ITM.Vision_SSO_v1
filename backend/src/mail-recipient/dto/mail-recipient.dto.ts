// backend/src/mail-recipient/dto/mail-recipient.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMailRecipientDto {
  @IsString()
  @IsNotEmpty()
  recipientEmail!: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsOptional()
  recipientType?: string;
}

export class UpdateMailRecipientDto {
  @IsString()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

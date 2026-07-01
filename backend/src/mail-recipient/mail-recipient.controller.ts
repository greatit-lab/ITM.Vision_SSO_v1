// backend/src/mail-recipient/mail-recipient.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MailRecipientService } from './mail-recipient.service';
import {
  CreateMailRecipientDto,
  UpdateMailRecipientDto,
} from './dto/mail-recipient.dto';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    [key: string]: any;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('mail-recipient')
export class MailRecipientController {
  constructor(private readonly mailRecipientService: MailRecipientService) {}

  @Get()
  async getAllRecipients(@Req() req: RequestWithUser): Promise<any> {
    const token = this.extractToken(req);
    return this.mailRecipientService.getAllRecipients(token);
  }

  @Get('system')
  async getSystemRecipients(): Promise<any> {
    return this.mailRecipientService.getSystemRecipients();
  }

  @Get('my')
  async getMyRecipients(@Req() req: RequestWithUser): Promise<any> {
    const token = this.extractToken(req);
    return this.mailRecipientService.getMyRecipients(token);
  }

  @Post()
  async createRecipient(
    @Req() req: RequestWithUser,
    @Body() dto: CreateMailRecipientDto,
  ): Promise<any> {
    const token = this.extractToken(req);
    return this.mailRecipientService.createRecipient(token, dto);
  }

  @Put(':id')
  async updateRecipient(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateMailRecipientDto,
  ): Promise<any> {
    const token = this.extractToken(req);
    return this.mailRecipientService.updateRecipient(Number(id), token, dto);
  }

  @Delete(':id')
  async deleteRecipient(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<any> {
    const token = this.extractToken(req);
    return this.mailRecipientService.deleteRecipient(Number(id), token);
  }

  private extractToken(req: RequestWithUser): string {
    const headers = req.headers as unknown as Record<string, string>;
    const auth = headers.authorization || '';
    return auth;
  }
}

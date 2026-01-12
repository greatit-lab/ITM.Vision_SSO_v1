// backend/src/infra/infra.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  InfraService,
  CreateSdwtDto,
  UpdateSdwtDto,
  CreateCfgServerDto,
  UpdateCfgServerDto,
} from './infra.service';

@Controller('infra')
export class InfraController {
  constructor(private readonly infraService: InfraService) {}

  // 1. SDWT
  @Get('sdwt')
  async getSdwts() {
    return await this.infraService.getSdwts();
  }

  // [추가] SDWT 생성 [변경: 타입 수정]
  @Post('sdwt')
  async createSdwt(@Body() body: CreateSdwtDto) {
    return await this.infraService.createSdwt(body);
  }

  // [추가] SDWT 수정 [변경: 타입 수정]
  @Put('sdwt/:id')
  async updateSdwt(
    @Param('id') id: string,
    @Body() body: UpdateSdwtDto,
  ) {
    return await this.infraService.updateSdwt(id, body);
  }

  // [추가] SDWT 삭제
  @Delete('sdwt/:id')
  async deleteSdwt(@Param('id') id: string) {
    return await this.infraService.deleteSdwt(id);
  }

  // 3. Agent Server (Per Eqp Config)
  @Get('agent-server')
  async getAgentServers() {
    return await this.infraService.getAgentServers();
  }

  // [변경: 타입 수정]
  @Post('agent-server')
  async createAgentServer(@Body() body: CreateCfgServerDto) {
    return await this.infraService.createAgentServer(body);
  }

  // [변경: 타입 수정]
  @Put('agent-server/:id')
  async updateAgentServer(
    @Param('id') id: string,
    @Body() body: UpdateCfgServerDto,
  ) {
    return await this.infraService.updateAgentServer(id, body);
  }

  @Delete('agent-server/:id')
  async deleteAgentServer(@Param('id') id: string) {
    return await this.infraService.deleteAgentServer(id);
  }
}

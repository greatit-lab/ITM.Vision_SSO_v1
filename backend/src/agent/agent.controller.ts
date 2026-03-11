// backend/src/agent/agent.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AgentService, AgentVersionDto, AgentPluginDto } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('versions')
  async getVersions(): Promise<AgentVersionDto[]> {
    // 반환받을 변수에도 명확한 타입을 지정하여 unsafe-assignment 에러를 방지합니다.
    const versions: AgentVersionDto[] = await this.agentService.getVersions();
    return versions;
  }

  @Get('plugins')
  async getPlugins(): Promise<AgentPluginDto[]> {
    // 반환받을 변수에도 명확한 타입을 지정합니다.
    const plugins: AgentPluginDto[] = await this.agentService.getPlugins();
    return plugins;
  }
}

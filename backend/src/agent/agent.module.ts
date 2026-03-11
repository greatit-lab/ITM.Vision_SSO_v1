// backend/src/agent/agent.module.ts
import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { CommonModule } from '../common/common.module'; // DataApiService를 쓰기 위해 주입

@Module({
  imports: [CommonModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}

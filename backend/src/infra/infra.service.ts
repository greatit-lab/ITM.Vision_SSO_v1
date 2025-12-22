// backend/src/infra/infra.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefSdwt, CfgServer, Prisma } from '@prisma/client';

@Injectable()
export class InfraService {
  constructor(private prisma: PrismaService) {}

  // --- 1. SDWT (ref_sdwt) ---
  async getSdwts(): Promise<RefSdwt[]> {
    return await this.prisma.refSdwt.findMany({
      orderBy: { sdwt: 'asc' },
    });
  }

  // --- 3. Agent Server Config (cfg_server) ---
  async getAgentServers(): Promise<CfgServer[]> {
    return await this.prisma.cfgServer.findMany({
      orderBy: { eqpid: 'asc' },
    });
  }

  async createAgentServer(data: Prisma.CfgServerCreateInput): Promise<CfgServer> {
    return await this.prisma.cfgServer.create({ data });
  }

  async updateAgentServer(eqpid: string, data: Prisma.CfgServerUpdateInput): Promise<CfgServer> {
    return await this.prisma.cfgServer.update({
      where: { eqpid },
      data,
    });
  }

  async deleteAgentServer(eqpid: string): Promise<CfgServer> {
    return await this.prisma.cfgServer.delete({
      where: { eqpid },
    });
  }
}

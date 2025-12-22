// backend/src/infra/infra.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InfraService {
  constructor(private prisma: PrismaService) {}

  // --- 1. SDWT (ref_sdwt) ---
  async getSdwts() {
    return this.prisma.refSdwt.findMany({
      orderBy: { sdwt: 'asc' },
    });
  }

  // --- 2. New Server Config (cfg_new_server) ---
  async getNewServers() {
    return this.prisma.cfgNewServer.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async createNewServer(data: any) {
    return this.prisma.cfgNewServer.create({ data });
  }

  async updateNewServer(id: number, data: any) {
    return this.prisma.cfgNewServer.update({
      where: { id },
      data,
    });
  }

  async deleteNewServer(id: number) {
    return this.prisma.cfgNewServer.delete({
      where: { id },
    });
  }

  // --- 3. Agent Server Config (cfg_server) ---
  async getAgentServers() {
    return this.prisma.cfgServer.findMany({
      orderBy: { eqpid: 'asc' },
    });
  }

  async createAgentServer(data: any) {
    return this.prisma.cfgServer.create({ data });
  }

  async updateAgentServer(eqpid: string, data: any) {
    return this.prisma.cfgServer.update({
      where: { eqpid },
      data,
    });
  }

  async deleteAgentServer(eqpid: string) {
    return this.prisma.cfgServer.delete({
      where: { eqpid },
    });
  }
}

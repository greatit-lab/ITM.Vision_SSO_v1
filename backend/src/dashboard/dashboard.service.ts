// backend/src/dashboard/dashboard.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

// Raw Query 결과 타입 정의
interface AgentStatusRawResult {
  eqpid: string;
  is_online: boolean;
  last_contact: Date | null;
  pc_name: string | null;
  cpu_usage: number;
  mem_usage: number;
  app_ver: string | null;
  type: string | null;
  ip_address: string | null;
  os: string | null;
  system_type: string | null;
  locale: string | null;
  timezone: string | null;
  today_alarm_count: number;
  last_perf_serv_ts: Date | null;
  last_perf_eqp_ts: Date | null;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // 버전 비교 헬퍼 함수
  private compareVersions(v1: string, v2: string) {
    const p1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const p2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  // [수정] 성능 최적화: 에러 통계 쿼리 경량화 및 DB 연결 안정성 강화 (순차 실행 적용)
  async getSummary(site?: string, sdwt?: string) {
    try {
      // 1. 최신 Agent 버전 조회
      const distinctVersions = await this.prisma.agentInfo.findMany({
        distinct: ['appVer'],
        select: { appVer: true },
        where: { appVer: { not: null } },
      });

      const versions = distinctVersions
        .map((v) => v.appVer)
        .filter((v) => v) as string[];

      versions.sort((a, b) => this.compareVersions(a, b));
      const latestAgentVersion =
        versions.length > 0 ? versions[versions.length - 1] : '';

      // 2. 필터 조건 생성
      const equipmentWhere: Prisma.RefEquipmentWhereInput = {
        sdwtRel: {
          isUse: 'Y',
          ...(site ? { site } : {}),
        },
        ...(sdwt ? { sdwt } : {}),
      };

      // 기준 시간 계산
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // 3. 주요 통계 조회 (안정성을 위해 순차 실행으로 변경)
      // Promise.all 사용 시 DB Connection Pool 한계로 "Can't reach database" 오류가 발생할 수 있음
      
      // (1) 전체 장비 수 (AgentInfo가 있는 장비만)
      const totalEqp = await this.prisma.refEquipment.count({ 
        where: { 
          ...equipmentWhere,
          agentInfo: { isNot: null } 
        } 
      });

      // (2) 전체 서버(Agent) 설정 수
      const totalServers = await this.prisma.cfgServer.count();

      // (3) 온라인 상태인 서버 수 (최근 10분 내 업데이트)
      const activeServers = await this.prisma.cfgServer.count({
        where: { update: { gte: tenMinutesAgo } }
      });

      // (4) 전체 SDWT(공정) 수
      const totalSdwts = await this.prisma.refSdwt.count({
        where: { isUse: 'Y', ...(site ? { site } : {}) }
      });

      // 4. 에러 통계 조회 (무거운 쿼리 분리 및 최적화)
      let todayErrorCount = 0;
      let todayErrorTotalCount = 0;
      let newAlarmCount = 0;

      try {
        // [병렬 실행 유지] 에러 카운트는 상대적으로 가벼운 인덱스 스캔이므로 병렬 처리 시도
        // 문제 발생 시 catch로 넘어가 메인 통계에는 영향 없도록 처리
        const [totalError, recentError] = await Promise.all([
          this.prisma.plgError.count({
            where: {
              timeStamp: { gte: startOfToday },
              equipment: equipmentWhere,
            },
          }),
          this.prisma.plgError.count({
            where: { timeStamp: { gte: oneHourAgo }, equipment: equipmentWhere },
          }),
        ]);

        todayErrorTotalCount = totalError;
        newAlarmCount = recentError;

        // [최적화] 장비별 에러 발생 장비 수 (Distinct Count)
        if (todayErrorTotalCount > 0) {
           const errorEqps = await this.prisma.plgError.findMany({
             where: {
               timeStamp: { gte: startOfToday },
               equipment: equipmentWhere,
             },
             distinct: ['eqpid'],
             select: { eqpid: true },
           });
           todayErrorCount = errorEqps.length;
        }

      } catch (err) {
        console.warn("[Dashboard] Error stats query failed or timed out:", err);
        // 에러 통계 실패 시 0으로 반환하여 전체 페이지 로딩 실패 방지
      }

      // [수정] Offline 계산 로직 변경
      // 기존: totalServers(18) - activeServers(1) = 17 (화면상 Total은 17이라 불일치 발생)
      // 변경: totalEqp(17) - activeServers(1) = 16 (화면상 Total과 일치)
      // 단, activeServers가 totalEqp보다 클 경우를 대비해 Math.max(0, ...) 처리
      const inactiveAgentCount = Math.max(0, totalEqp - activeServers);

      // 5. 결과 반환
      return {
        totalEqpCount: totalEqp,
        totalServers: totalServers,
        onlineAgentCount: activeServers,
        inactiveAgentCount: inactiveAgentCount, // 수정된 계산 로직 적용
        todayErrorCount,
        todayErrorTotalCount,
        newAlarmCount,
        latestAgentVersion,
        totalSdwts, 
        serverHealth: totalServers > 0 ? Math.round((activeServers / totalServers) * 100) : 0
      };

    } catch (error) {
      console.error("[DashboardService] getSummary Critical Error:", error);
      throw new InternalServerErrorException("Failed to fetch dashboard summary");
    }
  }

  // getAgentStatus 메서드는 기존 유지 (페이지네이션 적용 권장)
  async getAgentStatus(site?: string, sdwt?: string) {
    let whereCondition = Prisma.sql`WHERE r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE is_use = 'Y')`;

    if (sdwt) {
      whereCondition = Prisma.sql`${whereCondition} AND r.sdwt = ${sdwt}`;
    } else if (site) {
      whereCondition = Prisma.sql`${whereCondition} AND r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = ${site})`;
    }

    const results = await this.prisma.$queryRaw<AgentStatusRawResult[]>`
      SELECT 
          a.eqpid, 
          CASE WHEN COALESCE(s.status, 'OFFLINE') = 'ONLINE' THEN true ELSE false END AS is_online, 
          s.last_perf_update AS last_contact,
          a.pc_name, 
          COALESCE(p.cpu_usage, 0) AS cpu_usage, 
          COALESCE(p.mem_usage, 0) AS mem_usage, 
          a.app_ver,
          a.type, a.ip_address, a.os, a.system_type, a.locale, a.timezone,
          COALESCE(e.alarm_count, 0)::int AS today_alarm_count,
          p.serv_ts AS last_perf_serv_ts,
          p.ts AS last_perf_eqp_ts
      FROM public.agent_info a
      JOIN public.ref_equipment r ON a.eqpid = r.eqpid
      LEFT JOIN public.agent_status s ON a.eqpid = s.eqpid
      LEFT JOIN (
          SELECT eqpid, cpu_usage, mem_usage, serv_ts, ts, 
                 ROW_NUMBER() OVER(PARTITION BY eqpid ORDER BY serv_ts DESC) as rn
          FROM public.eqp_perf
          WHERE serv_ts >= NOW() - INTERVAL '1 day' 
      ) p ON a.eqpid = p.eqpid AND p.rn = 1
      LEFT JOIN (
          SELECT eqpid, COUNT(*) AS alarm_count 
          FROM public.plg_error 
          WHERE time_stamp >= CURRENT_DATE
          GROUP BY eqpid
      ) e ON a.eqpid = e.eqpid
      ${whereCondition}
      ORDER BY a.eqpid ASC;
    `;

    return results.map((r) => {
      let clockDrift: number | null = null;
      if (r.last_perf_serv_ts && r.last_perf_eqp_ts) {
        const servTs = new Date(r.last_perf_serv_ts).getTime();
        const eqpTs = new Date(r.last_perf_eqp_ts).getTime();
        clockDrift = (servTs - eqpTs) / 1000;
      }

      return {
        eqpId: r.eqpid,
        isOnline: r.is_online,
        lastContact: r.last_contact,
        pcName: r.pc_name,
        cpuUsage: r.cpu_usage,
        memoryUsage: r.mem_usage,
        appVersion: r.app_ver || '',
        type: r.type || '',
        ipAddress: r.ip_address || '',
        os: r.os || '',
        systemType: r.system_type || '',
        locale: r.locale || '',
        timezone: r.timezone || '',
        todayAlarmCount: r.today_alarm_count,
        clockDrift: clockDrift,
      };
    });
  }
}

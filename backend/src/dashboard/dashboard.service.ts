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

  // [수정] 성능 최적화: 메모리 연산 제거 및 DB Aggregation 활용
  async getSummary(site?: string, sdwt?: string) {
    try {
      // 1. 최신 Agent 버전 조회
      // distinct 쿼리는 인덱스를 타면 빠르므로 유지
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
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 10분 전
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // 3. 데이터 조회 (병렬 실행 최적화)
      // 변경점: cfgServer 전체를 가져오지 않고 count만 수행
      const [
        totalEqp, 
        totalServers, 
        activeServers, 
        totalSdwts,
        errorStats // 에러 통계는 별도 그룹화
      ] = await Promise.all([
        // [수정] Agent가 설치된 장비 수 (AgentInfo 기준)
        this.prisma.agentInfo.count({ 
          where: { 
            equipment: equipmentWhere 
          } 
        }),
        
        // [수정] 전체 서버 수 (단순 Count)
        this.prisma.cfgServer.count(),

        // [수정] 활성 서버 수 (DB Level Filtering)
        // update 컬럼이 인덱싱되어 있다면 매우 빠름
        this.prisma.cfgServer.count({
          where: {
            update: { gte: tenMinutesAgo }
          }
        }),

        // SDWT 구성 수
        this.prisma.refSdwt.count({
          where: { isUse: 'Y', ...(site ? { site } : {}) }
        }),

        // 에러 통계 (병렬 내부 처리)
        (async () => {
           try {
             const [groupByEqp, total, recent] = await Promise.all([
               this.prisma.plgError.groupBy({
                 by: ['eqpid'],
                 where: {
                   timeStamp: { gte: startOfToday },
                   equipment: equipmentWhere,
                 },
               }),
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
             return { todayErrorCount: groupByEqp.length, todayErrorTotalCount: total, newAlarmCount: recent };
           } catch (e) {
             console.warn("[Dashboard] Error stats query failed:", e);
             return { todayErrorCount: 0, todayErrorTotalCount: 0, newAlarmCount: 0 };
           }
        })()
      ]);

      // 6. 결과 반환
      return {
        totalEqpCount: totalEqp,
        totalServers: totalServers,
        onlineAgentCount: activeServers,
        inactiveAgentCount: totalServers - activeServers,
        todayErrorCount: errorStats.todayErrorCount,
        todayErrorTotalCount: errorStats.todayErrorTotalCount,
        newAlarmCount: errorStats.newAlarmCount,
        latestAgentVersion,
        totalSdwts, 
        serverHealth: totalServers > 0 ? Math.round((activeServers / totalServers) * 100) : 0
      };

    } catch (error) {
      console.error("[DashboardService] getSummary Critical Error:", error);
      throw new InternalServerErrorException("Failed to fetch dashboard summary");
    }
  }

  // getAgentStatus 메서드는 쿼리 최적화 유지
  // 참고: 데이터 양이 많아지면 이 부분은 '서버 사이드 페이지네이션'으로 변경하는 것을 강력 권장합니다.
  async getAgentStatus(site?: string, sdwt?: string) {
    let whereCondition = Prisma.sql`WHERE r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE is_use = 'Y')`;

    if (sdwt) {
      whereCondition = Prisma.sql`${whereCondition} AND r.sdwt = ${sdwt}`;
    } else if (site) {
      whereCondition = Prisma.sql`${whereCondition} AND r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = ${site})`;
    }

    // [Tip] public.eqp_perf 테이블의 (eqpid, serv_ts) 복합 인덱스가 있어야 이 쿼리가 빠릅니다.
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

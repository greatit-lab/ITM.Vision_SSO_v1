// backend/src/lamplife/lamplife.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// Raw Query 결과 매핑을 위한 인터페이스 정의
interface LampLifeRawResult {
  eqpId: string;
  lampId: string;
  servTs: Date; // DB에서는 DateTime 타입
  ageHour: number | null;
  lifespanHour: number | null;
  lastChanged: Date | null;
}

@Injectable()
export class LampLifeService {
  constructor(private prisma: PrismaService) {}

  async getLampStatus(site: string, sdwt?: string) {
    // 제네릭으로 반환 타입 명시 <LampLifeRawResult[]>
    const result = await this.prisma.$queryRaw<LampLifeRawResult[]>`
      SELECT 
        l.eqpid as "eqpId",
        l.lamp_id as "lampId",
        l.serv_ts as "servTs",
        l.age_hour as "ageHour",
        l.lifespan_hour as "lifespanHour",
        l.last_changed as "lastChanged"
      FROM eqp_lamp_life l
      JOIN ref_equipment e ON l.eqpid = e.eqpid
      JOIN ref_sdwt s ON e.sdwt = s.sdwt
      WHERE s.site = ${site}
        AND (${sdwt}::text IS NULL OR s.sdwt = ${sdwt})
        AND l.serv_ts = (
            SELECT MAX(l2.serv_ts)
            FROM eqp_lamp_life l2
            WHERE l2.eqpid = l.eqpid AND l2.lamp_id = l.lamp_id
        )
      ORDER BY l.eqpid, l.lamp_id
    `;

    // 타입이 명확해졌으므로 안전하게 접근 가능
    return result.map((row) => ({
      ...row,
      // Date 객체인지 확인 후 ISO 문자열 변환
      servTs: row.servTs instanceof Date ? row.servTs.toISOString() : null,
      lastChanged:
        row.lastChanged instanceof Date
          ? row.lastChanged.toISOString().split('T')[0]
          : null,
    }));
  }
}

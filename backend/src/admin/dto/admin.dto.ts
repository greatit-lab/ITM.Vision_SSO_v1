// backend/src/admin/dto/admin.dto.ts

export class CreateAdminDto {
  loginId: string;
  role: string;
  assignedBy?: string;
}

export class CreateAccessCodeDto {
  compid: string;
  deptid: string;
  description?: string;
  isActive?: string;
}

export class UpdateAccessCodeDto {
  deptid: string;
  description?: string;
  isActive?: string;
}

export class CreateGuestDto {
  loginId: string;
  deptName?: string;
  deptCode?: string;
  grantedRole?: string;
  validUntil: string | Date;
  reason?: string;
}

export class ApproveGuestRequestDto {
  reqId: number;
  validUntil: string | Date;
  grantedRole?: string;
  approverId: string;
}

export class RejectGuestRequestDto {
  reqId: number;
  approverId: string;
}

// Error Severity
export class CreateSeverityDto {
  errorId: string;
  severity: string;
}

export class UpdateSeverityDto {
  severity: string;
}

// Metrics
export class CreateMetricDto {
  metricName: string;
  isExcluded: boolean | string;
}

export class UpdateMetricDto {
  isExcluded: boolean | string;
}

// [추가] New Server Config (Migration Target)
export class UpdateNewServerDto {
  newDbHost?: string;
  newDbUser?: string;
  newDbPw?: string;
  newDbPort?: number;
  newFtpHost?: string;
  newFtpUser?: string;
  newFtpPw?: string;
  newFtpPort?: number;
  description?: string;
}

// [수정] CfgServer DTO (DB 구조 반영)
export class CreateCfgServerDto {
  eqpid: string;
  agentDbHost?: string;
  agentFtpHost?: string;
  updateFlag?: string;
}

export class UpdateCfgServerDto {
  agentDbHost?: string;
  agentFtpHost?: string;
  updateFlag?: string;
}

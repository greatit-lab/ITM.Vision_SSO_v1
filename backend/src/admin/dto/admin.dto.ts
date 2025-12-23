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

// [수정] 테이블 구조 변경 반영 (errorId, severity only)
export class CreateSeverityDto {
  errorId: string;
  severity: string;
}

// [수정] Update 시에는 severity만 변경 가능 (PK인 errorId는 변경 불가)
export class UpdateSeverityDto {
  severity: string;
}

export class CreateMetricDto {
  metricName: string;
  isExcluded: boolean | string;
}

export class UpdateMetricDto {
  isExcluded: boolean | string;
}

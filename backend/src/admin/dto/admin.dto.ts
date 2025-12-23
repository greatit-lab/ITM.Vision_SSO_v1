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

// [수정] 수동 생성 시 부서명/코드 입력 가능
export class CreateGuestDto {
  loginId: string;
  deptName?: string; // [추가]
  deptCode?: string; // [추가]
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

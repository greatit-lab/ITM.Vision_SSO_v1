// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { User } from './auth.interface';

// [수정] AD Profile 인터페이스에 CompName 추가
interface AdProfile extends Profile {
  'http://schemas.sec.com/2018/05/identity/claims/LoginId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompName'?: string; // [추가] 회사명 Claim
  'http://schemas.sec.com/2018/05/identity/claims/DeptId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/DeptName'?: string; // 부서명 Claim
  'http://schemas.sec.com/2018/05/identity/claims/Username'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/Mail'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/UserId'?: string;
  sAMAccountName?: string;
  memberOf?: string | string[];
  cn?: string;
  displayName?: string;
}

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  private readonly logger = new Logger(SamlStrategy.name);

  constructor() {
    // ... (기존 생성자 코드 유지) ...
    const samlConfig: SamlConfig = {
      entryPoint: process.env.SAML_ENTRY_POINT || '',
      issuer: process.env.SAML_ISSUER || '',
      callbackUrl: process.env.SAML_CALLBACK_URL || '',
      idpCert: process.env.SAML_IDP_CERT || '',
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
      disableRequestedAuthnContext: true,
      signatureAlgorithm: 'sha256',
      acceptedClockSkewMs: -1,
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: false,
      authnRequestBinding: 'HTTP-Redirect',
      logoutUrl: process.env.SAML_LOGOUT_URL || '',
      logoutCallbackUrl: process.env.SAML_CALLBACK_URL || '',
      privateKey: process.env.SAML_SP_PRIVATE_KEY || undefined,
    };
    super(samlConfig);
  }

  validate(profile: AdProfile): User {
    if (!profile) {
      this.logger.error('SAML Authentication Failed: No Profile received');
      throw new UnauthorizedException('SAML Authentication Failed: No Profile');
    }

    // ---------------------------------------------------------
    // [중요] AD에서 넘어오는 전체 데이터 로그 출력 (디버깅용)
    // 서버 로그에서 CompName, DeptName의 정확한 키(Key)와 값을 확인하세요.
    // ---------------------------------------------------------
    this.logger.log('=== [AD Claims Debug] ===');
    this.logger.log(JSON.stringify(profile, null, 2));
    this.logger.log('=========================');

    // 데이터 추출
    const rawCompId = profile['http://schemas.sec.com/2018/05/identity/claims/CompId'];
    
    // [추가] 회사명 추출 (Claim URL은 로그 확인 후 필요시 수정)
    const rawCompName = profile['http://schemas.sec.com/2018/05/identity/claims/CompName']; 

    const rawDeptId = profile['http://schemas.sec.com/2018/05/identity/claims/DeptId'];
    const rawDeptName = profile['http://schemas.sec.com/2018/05/identity/claims/DeptName'];

    const userId =
      profile['http://schemas.sec.com/2018/05/identity/claims/LoginId'] ||
      profile['http://schemas.sec.com/2018/05/identity/claims/UserId'] ||
      profile.nameID ||
      profile.sAMAccountName ||
      '';

    const email =
      profile['http://schemas.sec.com/2018/05/identity/claims/Mail'] ||
      profile.mail ||
      profile.email ||
      '';

    const name =
      profile['http://schemas.sec.com/2018/05/identity/claims/Username'] ||
      profile.displayName ||
      profile.cn ||
      '';

    const groups = profile.memberOf
      ? Array.isArray(profile.memberOf)
        ? profile.memberOf
        : [profile.memberOf]
      : [];

    const user: User = {
      userId: typeof userId === 'string' ? userId : '',
      email: typeof email === 'string' ? email : '',
      name: typeof name === 'string' ? name : '',
      department: rawDeptId || '',       // 부서 코드
      departmentName: rawDeptName || '', // 부서 명
      companyCode: typeof rawCompId === 'string' ? rawCompId : '', // 회사 코드
      companyName: typeof rawCompName === 'string' ? rawCompName : '', // [추가] 회사 명
      groups: groups,
      sessionIndex: profile.sessionIndex,
    };

    this.logger.log(`SAML Login Successful: ${user.userId} (${user.name})`);
    this.logger.log(`>> Dept: ${user.departmentName} (${user.department})`);
    this.logger.log(`>> Comp: ${user.companyName} (${user.companyCode})`);

    return user;
  }
  
  // ... (기존 getServiceProviderMetadata 등 유지)
}

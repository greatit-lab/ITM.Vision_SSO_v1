// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { User } from './auth.interface';

// [수정] AD Profile 인터페이스 정의 (Claim URL 매핑용)
interface AdProfile extends Profile {
  'http://schemas.sec.com/2018/05/identity/claims/LoginId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompName'?: string; // [추가] 회사명 Claim
  'http://schemas.sec.com/2018/05/identity/claims/DeptId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/DeptName'?: string;
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
    // SAML 설정 구성
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

    // 필수 설정 검증
    if (
      !samlConfig.entryPoint ||
      !samlConfig.idpCert ||
      !samlConfig.callbackUrl ||
      !samlConfig.issuer
    ) {
      throw new Error(
        '[SamlStrategy] Critical SAML configuration is missing. Please check your .env file.',
      );
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    super(samlConfig);
  }

  validate(profile: AdProfile): User {
    if (!profile) {
      this.logger.error('SAML Authentication Failed: No Profile received');
      throw new UnauthorizedException('SAML Authentication Failed: No Profile');
    }

    // ---------------------------------------------------------
    // [디버깅] AD Claim 데이터 확인
    // ---------------------------------------------------------
    this.logger.log('=== [AD Claims Debug] ===');
    this.logger.log(JSON.stringify(profile, null, 2));
    this.logger.log('=========================');

    // Claim 데이터 추출
    const rawCompId = profile['http://schemas.sec.com/2018/05/identity/claims/CompId'];
    
    // [추가] 회사명 추출 (로그 확인 후 키값이 다르면 수정 필요)
    const rawCompName = profile['http://schemas.sec.com/2018/05/identity/claims/CompName'];

    const rawDeptId = profile['http://schemas.sec.com/2018/05/identity/claims/DeptId'];
    const rawDeptName = profile['http://schemas.sec.com/2018/05/identity/claims/DeptName'];

    // 사용자 ID 추출 우선순위
    const userId =
      profile['http://schemas.sec.com/2018/05/identity/claims/LoginId'] ||
      profile['http://schemas.sec.com/2018/05/identity/claims/UserId'] ||
      profile.nameID ||
      profile.sAMAccountName ||
      '';

    // 이메일 추출 우선순위
    const email =
      profile['http://schemas.sec.com/2018/05/identity/claims/Mail'] ||
      profile.mail ||
      profile.email ||
      '';

    // 이름 추출 우선순위
    const name =
      profile['http://schemas.sec.com/2018/05/identity/claims/Username'] ||
      profile.displayName ||
      profile.cn ||
      '';

    // 그룹 정보 배열 처리
    const groups = profile.memberOf
      ? Array.isArray(profile.memberOf)
        ? profile.memberOf
        : [profile.memberOf]
      : [];

    // [핵심] User 객체 생성 (auth.interface.ts와 일치해야 함)
    const user: User = {
      userId: typeof userId === 'string' ? userId : '',
      email: typeof email === 'string' ? email : '',
      name: typeof name === 'string' ? name : '',             // 에러 발생 지점 해결
      department: rawDeptId || '',
      departmentName: rawDeptName || '',
      companyCode: typeof rawCompId === 'string' ? rawCompId : '',
      companyName: typeof rawCompName === 'string' ? rawCompName : '', // 에러 발생 지점 해결
      groups: groups,
      sessionIndex: profile.sessionIndex,
    };

    this.logger.log(`SAML Login Successful: ${user.userId} (${user.name})`);
    this.logger.log(`>> Dept: ${user.departmentName} (${user.department})`);
    this.logger.log(`>> Comp: ${user.companyName} (${user.companyCode})`);

    return user;
  }

  getServiceProviderMetadata(): string {
    let signingCert = process.env.SAML_SP_PUBLIC_CERT || null;
    if (signingCert) {
      signingCert = signingCert.replace(/\\n/g, '\n');
    }
    return this.generateServiceProviderMetadata(null, signingCert);
  }
}

// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { User } from './auth.interface';

interface AdProfile extends Profile {
  'http://schemas.sec.com/2018/05/identity/claims/LoginId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/DeptId'?: string; // [수정] 부서 ID 추가
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

    // [🔍 DEBUGGER START] -----------------------------------------------------------
    const rawCompId =
      profile['http://schemas.sec.com/2018/05/identity/claims/CompId'];
    // [수정] DeptName 대신 DeptId 추출
    const rawDeptId =
      profile['http://schemas.sec.com/2018/05/identity/claims/DeptId'];

    // 혹시 몰라 이름도 받아둠 (로그용)
    const rawDeptName =
      profile['http://schemas.sec.com/2018/05/identity/claims/DeptName'];

    this.logger.warn('========== [SAML Profile Debugger] ==========');
    this.logger.warn(`👉 CompId (회사코드): ${rawCompId}`);
    this.logger.warn(`👉 DeptId (부서코드): ${rawDeptId}`);
    this.logger.log(`   (참고) DeptName: ${rawDeptName}`); // 이름은 참고용으로만 출력
    this.logger.log('---------------- Raw Profile Data ----------------');
    console.log(JSON.stringify(profile, null, 2));
    this.logger.warn('=============================================');
    // [🔍 DEBUGGER END] -------------------------------------------------------------

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

    // [수정] user.department 필드에 'DeptId'를 할당합니다.
    const deptId = rawDeptId || '';
    const companyCode = rawCompId || '';

    const groups = profile.memberOf
      ? Array.isArray(profile.memberOf)
        ? profile.memberOf
        : [profile.memberOf]
      : [];

    const user: User = {
      userId: typeof userId === 'string' ? userId : '',
      email: typeof email === 'string' ? email : '',
      name: typeof name === 'string' ? name : '',
      department: deptId, // [중요] 여기에 부서 코드가 들어감
      companyCode: typeof companyCode === 'string' ? companyCode : '',
      groups: groups,
      sessionIndex: profile.sessionIndex,
    };

    this.logger.log(`SAML Login Successful: ${user.userId} (${user.name})`);

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

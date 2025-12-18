// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { User } from './auth.interface';

interface AdProfile extends Profile {
  'http://schemas.sec.com/2018/05/identity/claims/LoginId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/DeptId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/DeptName'?: string; // 부서명
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

    // 데이터 추출
    const rawCompId =
      profile['http://schemas.sec.com/2018/05/identity/claims/CompId'];
    const rawDeptId =
      profile['http://schemas.sec.com/2018/05/identity/claims/DeptId'];
    const rawDeptName =
      profile['http://schemas.sec.com/2018/05/identity/claims/DeptName'];

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
      department: rawDeptId || '',      // 부서 코드
      departmentName: rawDeptName || '', // [추가] 부서 명
      companyCode: typeof rawCompId === 'string' ? rawCompId : '',
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

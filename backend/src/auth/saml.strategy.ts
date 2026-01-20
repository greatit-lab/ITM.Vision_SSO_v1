// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { ConfigService } from '@nestjs/config';
import { User } from './auth.interface';

// AD Profile 인터페이스 정의
interface AdProfile extends Profile {
  'http://schemas.sec.com/2018/05/identity/claims/LoginId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompName'?: string;
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

  constructor(private readonly configService: ConfigService) {
    
    // [수정] 환경변수 이름 통일 (SAML_CERT -> SAML_IDP_CERT)
    const entryPoint = configService.get<string>('SAML_ENTRY_POINT');
    const issuer = configService.get<string>('SAML_ISSUER');
    const callbackUrl = configService.get<string>('SAML_CALLBACK_URL');
    const idpCert = configService.get<string>('SAML_IDP_CERT'); // [변경됨] .env 파일과 일치시킴
    const logoutUrl = configService.get<string>('SAML_LOGOUT_URL');
    const privateKey = configService.get<string>('SAML_SP_PRIVATE_KEY');

    // 필수 설정 검증
    if (!entryPoint || !idpCert || !callbackUrl || !issuer) {
      const missing = [
        !entryPoint && 'SAML_ENTRY_POINT',
        !idpCert && 'SAML_IDP_CERT', // [변경됨] 에러 메시지도 수정
        !callbackUrl && 'SAML_CALLBACK_URL',
        !issuer && 'SAML_ISSUER',
      ].filter(Boolean).join(', ');
      
      throw new Error(
        `[SamlStrategy] Critical SAML configuration is missing: [${missing}]. Please check your .env file path and variables.`,
      );
    }

    const samlConfig: SamlConfig = {
      entryPoint: entryPoint,
      issuer: issuer,
      callbackUrl: callbackUrl,
      idpCert: idpCert,
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
      disableRequestedAuthnContext: true,
      signatureAlgorithm: 'sha256',
      acceptedClockSkewMs: -1,
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: false,
      authnRequestBinding: 'HTTP-Redirect',
      logoutUrl: logoutUrl || entryPoint,
      logoutCallbackUrl: callbackUrl,
      privateKey: privateKey || undefined,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    super(samlConfig);
  }

  validate(profile: AdProfile): User {
    if (!profile) {
      this.logger.error('SAML Authentication Failed: No Profile received');
      throw new UnauthorizedException('SAML Authentication Failed: No Profile');
    }

    this.logger.log('=== [AD Claims Debug] ===');
    this.logger.log(JSON.stringify(profile, null, 2));
    this.logger.log('=========================');

    const rawCompId = profile['http://schemas.sec.com/2018/05/identity/claims/CompId'];
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
      department: rawDeptId || '',
      departmentName: rawDeptName || '',
      companyCode: typeof rawCompId === 'string' ? rawCompId : '',
      companyName: typeof rawCompName === 'string' ? rawCompName : '',
      groups: groups,
      sessionIndex: profile.sessionIndex,
    };

    this.logger.log(`SAML Login Successful: ${user.userId} (${user.name})`);
    this.logger.log(`>> Dept: ${user.departmentName} (${user.department})`);
    this.logger.log(`>> Comp: ${user.companyName} (${user.companyCode})`);

    return user;
  }

  getServiceProviderMetadata(): string {
    let signingCert = this.configService.get<string>('SAML_SP_PUBLIC_CERT') || null;
    if (signingCert) {
      signingCert = signingCert.replace(/\\n/g, '\n');
    }
    return this.generateServiceProviderMetadata(null, signingCert);
  }
}

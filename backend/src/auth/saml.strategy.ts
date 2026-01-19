// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { ConfigService } from '@nestjs/config'; // [추가]
import { User } from './auth.interface';

// AD Profile 인터페이스 정의 (Claim URL 매핑용)
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

  // [개선] ConfigService 주입
  constructor(private readonly configService: ConfigService) {
    
    // [개선] 환경변수 로드 (ConfigService 사용)
    const entryPoint = configService.get<string>('SAML_ENTRY_POINT');
    const issuer = configService.get<string>('SAML_ISSUER');
    const callbackUrl = configService.get<string>('SAML_CALLBACK_URL');
    const idpCert = configService.get<string>('SAML_CERT');
    const logoutUrl = configService.get<string>('SAML_LOGOUT_URL');
    const privateKey = configService.get<string>('SAML_SP_PRIVATE_KEY');

    // [중요] 필수 설정 검증 로직 (누락 시 명확한 에러 발생)
    if (!entryPoint || !idpCert || !callbackUrl || !issuer) {
      const missing = [
        !entryPoint && 'SAML_ENTRY_POINT',
        !idpCert && 'SAML_CERT',
        !callbackUrl && 'SAML_CALLBACK_URL',
        !issuer && 'SAML_ISSUER',
      ].filter(Boolean).join(', ');
      
      throw new Error(
        `[SamlStrategy] Critical SAML configuration is missing: [${missing}]. Please check your .env file path and variables.`,
      );
    }

    // SAML 설정 구성
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
      logoutUrl: logoutUrl || entryPoint, // 로그아웃 URL 없으면 엔트리 포인트 사용
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

    // ---------------------------------------------------------
    // [디버깅] AD Claim 데이터 확인
    // ---------------------------------------------------------
    this.logger.log('=== [AD Claims Debug] ===');
    this.logger.log(JSON.stringify(profile, null, 2));
    this.logger.log('=========================');

    // Claim 데이터 추출
    const rawCompId = profile['http://schemas.sec.com/2018/05/identity/claims/CompId'];
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

    // User 객체 생성
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

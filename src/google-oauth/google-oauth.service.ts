import { Credentials, OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string | null;
  pictureUrl?: string | null;
}

export abstract class GoogleOauthService {
  abstract getOAuthUrl(): string;
  abstract exchangeCode(code: string): Promise<Credentials>;
  abstract handleCallback(
    code: string,
  ): Promise<{ userId: string; email: string }>;
  abstract fetchUserInfo(tokens: Credentials): Promise<GoogleUserInfo>;
  abstract authorizedClient(userId: string): Promise<OAuth2Client>;
}

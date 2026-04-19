import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google } from 'googleapis';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { config } from 'src/config/config';
import { OAuthAccountsService } from 'src/oauth-accounts/oauth-accounts.service';
import { UsersService } from 'src/users/users.service';
import {
  GOOGLE_OAUTH_SCOPES,
  GOOGLE_PROVIDER,
} from 'src/google-oauth/google-oauth.constants';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string | null;
  pictureUrl?: string | null;
}

@Injectable()
export class GoogleOauthService {
  private readonly logger = new Logger(GoogleOauthService.name);

  constructor(
    @Inject(config.KEY)
    private readonly envConfig: ConfigType<typeof config>,
    private readonly oauthAccountsService: OAuthAccountsService,
    private readonly usersService: UsersService,
  ) {}

  private createClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.envConfig.google.clientId,
      this.envConfig.google.clientSecret,
      this.envConfig.google.redirectUri,
    );
  }

  getOAuthUrl(): string {
    return this.createClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: GOOGLE_OAUTH_SCOPES,
    });
  }

  async exchangeCode(code: string): Promise<Credentials> {
    const client = this.createClient();
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  async handleCallback(
    code: string,
  ): Promise<{ userId: string; email: string }> {
    const tokens = await this.exchangeCode(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new InternalServerErrorException(
        'Google token exchange did not return both access_token and refresh_token',
      );
    }
    const profile = await this.fetchUserInfo(tokens);

    const user = await this.usersService.upsertByEmail({
      email: profile.email,
      name: profile.name,
      pictureUrl: profile.pictureUrl,
    });

    await this.oauthAccountsService.upsertForUser({
      userId: user.id,
      provider: GOOGLE_PROVIDER,
      providerAccountId: profile.sub,
      providerEmail: profile.email,
      scope: tokens.scope ?? '',
      tokenType: tokens.token_type ?? null,
      accessToken: tokens.access_token,
      accessTokenExpiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : null,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token ?? null,
    });

    return { userId: user.id, email: user.email };
  }

  async fetchUserInfo(tokens: Credentials): Promise<GoogleUserInfo> {
    const client = this.createClient();
    client.setCredentials(tokens);

    const { data } = await google
      .oauth2({ version: 'v2', auth: client })
      .userinfo.get();

    if (!data.id || !data.email) {
      throw new InternalServerErrorException(
        'Google userinfo response missing id or email',
      );
    }

    return {
      sub: data.id,
      email: data.email,
      name: data.name ?? null,
      pictureUrl: data.picture ?? null,
    };
  }

  async authorizedClient(userId: string): Promise<OAuth2Client> {
    const stored = await this.oauthAccountsService.getByUserAndProvider(
      userId,
      GOOGLE_PROVIDER,
    );
    if (!stored || !stored.refreshToken) {
      throw new UnauthorizedException(
        `No Google credentials stored for user ${userId}. Complete /v1/auth/google first.`,
      );
    }

    const client = this.createClient();
    client.setCredentials({
      access_token: stored.accessToken ?? undefined,
      refresh_token: stored.refreshToken,
      expiry_date: stored.accessTokenExpiresAt?.getTime() ?? undefined,
      scope: stored.scope,
      token_type: stored.tokenType ?? 'Bearer',
    });

    // google-auth-library auto-refreshes when access_token is missing/expired.
    // The 'tokens' event fires with the new credentials; persist them so subsequent
    // requests reuse the fresh access_token instead of refreshing again.
    client.on('tokens', (tokens) => {
      void this.oauthAccountsService
        .updateRefreshedTokens(userId, GOOGLE_PROVIDER, tokens)
        .catch((err) => {
          this.logger.error(
            `Failed to persist refreshed Google tokens for user ${userId}`,
            err instanceof Error ? err.stack : String(err),
          );
        });
    });

    return client;
  }
}

import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google } from 'googleapis';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { config } from 'src/config/config';
import { OAuthAccountsService } from 'src/oauth-accounts/oauth-accounts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import {
  GOOGLE_OAUTH_SCOPES,
  GOOGLE_PROVIDER,
} from 'src/google-oauth/google-oauth.constants';

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string | null;
  pictureUrl?: string | null;
}

@Injectable()
export class GoogleOauthService {
  constructor(
    @Inject(config.KEY)
    private readonly envConfig: ConfigType<typeof config>,
    private readonly oauthAccountsService: OAuthAccountsService,
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  getOAuthUrl(): string {
    return this.createClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: GOOGLE_OAUTH_SCOPES,
    });
  }

  async handleCallback(
    code: string,
  ): Promise<{ userId: string; email: string }> {
    const tokens = await this.exchangeCode(code);
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      scope,
      token_type: tokenType,
      expiry_date: expiryDate,
    } = tokens;
    if (!accessToken || !refreshToken || !scope || !tokenType || !expiryDate) {
      throw new InternalServerErrorException(
        'Google token exchange response missing required fields',
      );
    }
    const profile = await this.fetchUserInfo(tokens);

    return this.prismaService.$transaction(async (tx) => {
      const user = await this.usersService.upsertByEmail(
        {
          email: profile.email,
          name: profile.name,
          pictureUrl: profile.pictureUrl,
        },
        tx,
      );

      await this.oauthAccountsService.upsertForUser(
        {
          userId: user.id,
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.sub,
          providerEmail: profile.email,
          scope,
          tokenType,
          accessToken,
          accessTokenExpiresAt: new Date(expiryDate),
          refreshToken,
        },
        tx,
      );

      return { userId: user.id, email: user.email };
    });
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
      access_token: stored.accessToken,
      refresh_token: stored.refreshToken,
      expiry_date: stored.accessTokenExpiresAt.getTime(),
      scope: stored.scope,
      token_type: stored.tokenType,
    });

    // google-auth-library auto-refreshes when access_token is missing/expired.
    // The 'tokens' event fires with the new credentials; persist them so subsequent
    // requests reuse the fresh access_token instead of refreshing again.
    client.on('tokens', (tokens) => {
      if (!tokens.access_token || !tokens.expiry_date || !tokens.token_type) {
        return;
      }
      void this.oauthAccountsService.updateRefreshedTokens(
        userId,
        GOOGLE_PROVIDER,
        {
          accessToken: tokens.access_token,
          accessTokenExpiresAt: new Date(tokens.expiry_date),
          tokenType: tokens.token_type,
          refreshToken: tokens.refresh_token ?? undefined,
          scope: tokens.scope ?? undefined,
        },
      );
    });

    return client;
  }

  private async exchangeCode(code: string): Promise<Credentials> {
    const client = this.createClient();
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  private async fetchUserInfo(tokens: Credentials): Promise<GoogleUserInfo> {
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

  private createClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.envConfig.google.clientId,
      this.envConfig.google.clientSecret,
      this.envConfig.google.redirectUri,
    );
  }
}

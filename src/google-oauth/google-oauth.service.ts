import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { config } from 'src/config/config';
import { GOOGLE_PROVIDER } from 'src/google-oauth/google-oauth.constants';
import { OAuthAccountsService } from 'src/oauth-accounts/oauth-accounts.service';

@Injectable()
export class GoogleOauthService {
  constructor(
    @Inject(config.KEY)
    private readonly envConfig: ConfigType<typeof config>,
    private readonly oauthAccountsService: OAuthAccountsService,
  ) {}

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

  private createClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.envConfig.google.clientId,
      this.envConfig.google.clientSecret,
      this.envConfig.google.redirectUri,
    );
  }
}

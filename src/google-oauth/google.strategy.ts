import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import type { AuthenticatedUser } from 'src/auth/types';
import { config } from 'src/config/config';
import {
  GOOGLE_OAUTH_SCOPES,
  GOOGLE_PROVIDER,
} from 'src/google-oauth/google-oauth.constants';
import { OAuthAccountsService } from 'src/oauth-accounts/oauth-accounts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

interface GoogleTokenParams {
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google', true) {
  constructor(
    @Inject(config.KEY) envConfig: ConfigType<typeof config>,
    private readonly usersService: UsersService,
    private readonly oauthAccountsService: OAuthAccountsService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      clientID: envConfig.google.clientId,
      clientSecret: envConfig.google.clientSecret,
      callbackURL: envConfig.google.redirectUri,
      scope: GOOGLE_OAUTH_SCOPES,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    params: GoogleTokenParams,
    profile: Profile,
  ): Promise<AuthenticatedUser> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new InternalServerErrorException(
        'Google profile missing email address',
      );
    }
    if (!refreshToken) {
      throw new InternalServerErrorException(
        'Google did not return a refresh_token; ensure prompt=consent and offline access',
      );
    }

    const expiresInSec = params.expires_in ?? 3600;
    const tokenType = params.token_type ?? 'Bearer';
    const scope = params.scope ?? GOOGLE_OAUTH_SCOPES.join(' ');

    return this.prismaService.$transaction(async (tx) => {
      const user = await this.usersService.upsertByEmail(
        {
          email,
          name: profile.displayName ?? null,
          pictureUrl: profile.photos?.[0]?.value ?? null,
        },
        tx,
      );

      await this.oauthAccountsService.upsertForUser(
        {
          userId: user.id,
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.id,
          providerEmail: email,
          scope,
          tokenType,
          accessToken,
          accessTokenExpiresAt: new Date(Date.now() + expiresInSec * 1000),
          refreshToken,
        },
        tx,
      );

      return { id: user.id, email: user.email };
    });
  }
}

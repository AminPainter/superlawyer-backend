import { Injectable } from '@nestjs/common';
import type { OAuthAccount, Prisma } from 'generated/prisma/client';
import { CryptoService } from 'src/crypto/crypto.service';
import { OAuthAccountsRepository } from 'src/oauth-accounts/oauth-accounts.repository';

export type UpsertOAuthAccountInput = Omit<
  Prisma.OAuthAccountUncheckedCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>;

export type OAuthAccountTokens = Pick<
  OAuthAccount,
  | 'accessToken'
  | 'refreshToken'
  | 'accessTokenExpiresAt'
  | 'scope'
  | 'tokenType'
>;

export type RefreshedTokens = {
  accessToken: string;
  accessTokenExpiresAt: Date;
  tokenType: string;
  refreshToken?: string;
  scope?: string;
};

@Injectable()
export class OAuthAccountsService {
  constructor(
    private readonly oauthAccountsRepository: OAuthAccountsRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async upsertForUser(
    input: UpsertOAuthAccountInput,
    tx?: Prisma.TransactionClient,
  ): Promise<OAuthAccount> {
    const [accessTokenSealed, refreshTokenSealed] = await Promise.all([
      this.cryptoService.seal(input.accessToken),
      this.cryptoService.seal(input.refreshToken),
    ]);

    return this.oauthAccountsRepository.upsertByProviderAccount(
      {
        userId: input.userId,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        providerEmail: input.providerEmail,
        scope: input.scope,
        tokenType: input.tokenType,
        accessToken: accessTokenSealed,
        accessTokenExpiresAt: input.accessTokenExpiresAt,
        refreshToken: refreshTokenSealed,
      },
      tx,
    );
  }

  async getByUserAndProvider(
    userId: string,
    provider: string,
  ): Promise<OAuthAccountTokens | null> {
    const row = await this.oauthAccountsRepository.findByUserAndProvider(
      userId,
      provider,
    );
    if (!row) return null;

    const [accessToken, refreshToken] = await Promise.all([
      this.cryptoService.unseal(row.accessToken),
      this.cryptoService.unseal(row.refreshToken),
    ]);
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: row.accessTokenExpiresAt,
      scope: row.scope,
      tokenType: row.tokenType,
    };
  }

  async updateRefreshedTokens(
    userId: string,
    provider: string,
    tokens: RefreshedTokens,
  ): Promise<void> {
    const [accessTokenSealed, refreshTokenSealed] = await Promise.all([
      this.cryptoService.seal(tokens.accessToken),
      tokens.refreshToken ? this.cryptoService.seal(tokens.refreshToken) : null,
    ]);

    await this.oauthAccountsRepository.updateTokensByUserAndProvider(
      userId,
      provider,
      {
        accessToken: accessTokenSealed,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        tokenType: tokens.tokenType,
        ...(refreshTokenSealed ? { refreshToken: refreshTokenSealed } : {}),
        ...(tokens.scope ? { scope: tokens.scope } : {}),
      },
    );
  }
}

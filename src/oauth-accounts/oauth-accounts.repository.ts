import { Injectable } from '@nestjs/common';
import { Prisma, type OAuthAccount } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OAuthAccountsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertByProviderAccount(
    input: Prisma.OAuthAccountUncheckedCreateInput,
    tx: Prisma.TransactionClient = this.prismaService,
  ): Promise<OAuthAccount> {
    return tx.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      },
      create: input,
      update: {
        userId: input.userId,
        providerEmail: input.providerEmail ?? null,
        scope: input.scope,
        tokenType: input.tokenType,
        accessToken: input.accessToken,
        accessTokenExpiresAt: input.accessTokenExpiresAt,
        refreshToken: input.refreshToken,
      },
    });
  }

  async findByUserAndProvider(
    userId: string,
    provider: string,
  ): Promise<OAuthAccount | null> {
    return this.prismaService.oAuthAccount.findFirst({
      where: { userId, provider },
    });
  }

  async updateTokensByUserAndProvider(
    userId: string,
    provider: string,
    data: Prisma.OAuthAccountUpdateManyMutationInput,
  ): Promise<{ count: number }> {
    return this.prismaService.oAuthAccount.updateMany({
      where: { userId, provider },
      data,
    });
  }
}

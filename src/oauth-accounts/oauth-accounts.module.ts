import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OAuthAccountsRepository } from 'src/oauth-accounts/oauth-accounts.repository';
import { OAuthAccountsService } from 'src/oauth-accounts/oauth-accounts.service';

@Module({
  imports: [PrismaModule],
  providers: [OAuthAccountsService, OAuthAccountsRepository],
  exports: [OAuthAccountsService],
})
export class OAuthAccountsModule {}

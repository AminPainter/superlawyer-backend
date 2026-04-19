import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OAuthAccountsService } from 'src/oauth-accounts/oauth-accounts.service';

@Module({
  imports: [PrismaModule],
  providers: [OAuthAccountsService],
  exports: [OAuthAccountsService],
})
export class OAuthAccountsModule {}

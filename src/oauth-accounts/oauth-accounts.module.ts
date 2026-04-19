import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OAuthAccountsService } from './oauth-accounts.service';

@Module({
  imports: [PrismaModule],
  providers: [OAuthAccountsService],
  exports: [OAuthAccountsService],
})
export class OAuthAccountsModule {}

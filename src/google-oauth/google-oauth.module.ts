import { Module } from '@nestjs/common';
import { GoogleOauthController } from 'src/google-oauth/google-oauth.controller';
import { GoogleOauthService } from 'src/google-oauth/google-oauth.service';
import { OAuthAccountsModule } from 'src/oauth-accounts/oauth-accounts.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [OAuthAccountsModule, PrismaModule, UsersModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthService],
  exports: [GoogleOauthService],
})
export class GoogleOauthModule {}

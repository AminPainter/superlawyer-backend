import { Module } from '@nestjs/common';
import { GoogleOauthController } from 'src/google-oauth/google-oauth.controller';
import { GoogleOauthService } from 'src/google-oauth/google-oauth.service';
import { GoogleapisOauthService } from 'src/google-oauth/googleapis-oauth.service';
import { OAuthAccountsModule } from 'src/oauth-accounts/oauth-accounts.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [OAuthAccountsModule, PrismaModule, UsersModule],
  controllers: [GoogleOauthController],
  providers: [{ provide: GoogleOauthService, useClass: GoogleapisOauthService }],
  exports: [GoogleOauthService],
})
export class GoogleOauthModule {}

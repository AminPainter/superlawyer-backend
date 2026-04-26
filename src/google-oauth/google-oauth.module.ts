import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleAuthGuard } from 'src/google-oauth/google-auth.guard';
import { GoogleOauthController } from 'src/google-oauth/google-oauth.controller';
import { GoogleOauthService } from 'src/google-oauth/google-oauth.service';
import { GoogleStrategy } from 'src/google-oauth/google.strategy';
import { OAuthAccountsModule } from 'src/oauth-accounts/oauth-accounts.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [AuthModule, OAuthAccountsModule, PrismaModule, UsersModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthService, GoogleStrategy, GoogleAuthGuard],
  exports: [GoogleOauthService],
})
export class GoogleOauthModule {}

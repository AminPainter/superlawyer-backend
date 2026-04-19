import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleOauthController } from 'src/google-oauth/google-oauth.controller';
import { GoogleOauthService } from 'src/google-oauth/google-oauth.service';
import { config } from 'src/config/config';
import { OAuthAccountsModule } from 'src/oauth-accounts/oauth-accounts.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ConfigModule.forFeature(config),
    OAuthAccountsModule,
    UsersModule,
  ],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthService],
  exports: [GoogleOauthService],
})
export class GoogleOauthModule {}

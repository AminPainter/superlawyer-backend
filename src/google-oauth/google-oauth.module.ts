import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthService } from './google-oauth.service';
import { config } from '../config/config';
import { OAuthAccountsModule } from '../oauth-accounts/oauth-accounts.module';
import { UsersModule } from '../users/users.module';

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

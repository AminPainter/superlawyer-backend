import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from '../crypto/crypto.module';
import { GoogleOauthModule } from '../google-oauth/google-oauth.module';
import { GoogleDocsModule } from '../google-docs/google-docs.module';
import { OAuthAccountsModule } from '../oauth-accounts/oauth-accounts.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { config } from '../config/config';
import { validateEnv } from '../config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: validateEnv,
    }),
    PrismaModule,
    CryptoModule,
    UsersModule,
    OAuthAccountsModule,
    GoogleOauthModule,
    GoogleDocsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

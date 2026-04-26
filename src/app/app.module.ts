import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app/app.controller';
import { CryptoModule } from 'src/crypto/crypto.module';
import { GoogleOauthModule } from 'src/google-oauth/google-oauth.module';
import { OAuthAccountsModule } from 'src/oauth-accounts/oauth-accounts.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { config } from 'src/config/config';
import { validateEnv } from 'src/config/env.validation';

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
  ],
  controllers: [AppController],
})
export class AppModule {}

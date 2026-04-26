import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AppController } from 'src/app/app.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CryptoModule } from 'src/crypto/crypto.module';
import { GoogleDocsModule } from 'src/google-docs/google-docs.module';
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
    BullModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (cfg: ConfigType<typeof config>) => ({
        connection: {
          host: cfg.redis.host,
          port: cfg.redis.port,
          password: cfg.redis.password,
        },
      }),
    }),
    PrismaModule,
    CryptoModule,
    UsersModule,
    OAuthAccountsModule,
    AuthModule,
    GoogleOauthModule,
    GoogleDocsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

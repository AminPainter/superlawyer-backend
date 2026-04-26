import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { config } from 'src/config/config';
import { UsersModule } from 'src/users/users.module';

type ExpiresIn = NonNullable<
  NonNullable<JwtModuleOptions['signOptions']>['expiresIn']
>;

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (envConfig: ConfigType<typeof config>): JwtModuleOptions => ({
        secret: envConfig.jwt.secret,
        signOptions: {
          expiresIn: envConfig.jwt.expiresIn as ExpiresIn,
          issuer: envConfig.jwt.issuer,
          audience: envConfig.jwt.audience,
        },
      }),
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}

import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from 'src/auth/auth.constants';
import { AuthService } from 'src/auth/auth.service';
import { SkipJwtAuthGuard } from 'src/auth/decorators/skip-jwt-auth-guard.decorator';
import type { AuthenticatedUser } from 'src/auth/types';
import { config } from 'src/config/config';
import { GoogleAuthGuard } from 'src/google-oauth/google-auth.guard';

@SkipJwtAuthGuard()
@Controller({ path: 'auth/google', version: '1' })
export class GoogleOauthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(config.KEY)
    private readonly envConfig: ConfigType<typeof config>,
  ) {}

  @UseGuards(GoogleAuthGuard)
  @Get('/')
  login() {
    // GoogleAuthGuard redirects to Google's consent screen; this body is unreachable.
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/callback')
  callback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthenticatedUser;
    const { token, maxAgeSeconds } = this.authService.issueAccessToken(user);

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.envConfig.app.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds * 1000,
      domain: this.envConfig.app.cookieDomain ?? undefined,
    });
    res.redirect(303, this.envConfig.app.frontendPostLoginUrl);
  }
}

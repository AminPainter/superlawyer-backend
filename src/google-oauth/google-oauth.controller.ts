import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OauthCallbackQueryDto } from 'src/google-oauth/dto/oauth-callback.dto';
import { GoogleOauthService } from 'src/google-oauth/google-oauth.service';

@Controller({ path: 'auth/google', version: '1' })
export class GoogleOauthController {
  constructor(private readonly googleOAuthService: GoogleOauthService) {}

  @Get('/')
  getOAuthUrl(@Res() res: Response) {
    res.redirect(this.googleOAuthService.getOAuthUrl());
  }

  @Get('/callback')
  async callback(@Query() query: OauthCallbackQueryDto, @Res() res: Response) {
    if (query.error)
      throw new BadRequestException(`Google OAuth error: ${query.error}`);

    if (!query.code)
      throw new BadRequestException('Missing authorization code');

    const result = await this.googleOAuthService.handleCallback(query.code);
    res.json(result);
  }
}

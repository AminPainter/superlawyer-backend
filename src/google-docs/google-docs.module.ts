import { Module } from '@nestjs/common';
import { GoogleDocsController } from './google-docs.controller';
import { GoogleDocsService } from './google-docs.service';
import { GoogleOauthModule } from '../google-oauth/google-oauth.module';

@Module({
  imports: [GoogleOauthModule],
  controllers: [GoogleDocsController],
  providers: [GoogleDocsService],
})
export class GoogleDocsModule {}

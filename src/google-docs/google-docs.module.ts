import { Module } from '@nestjs/common';
import { GoogleDocsController } from 'src/google-docs/google-docs.controller';
import { GoogleDocsService } from 'src/google-docs/google-docs.service';
import { GoogleOauthModule } from 'src/google-oauth/google-oauth.module';

@Module({
  imports: [GoogleOauthModule],
  controllers: [GoogleDocsController],
  providers: [GoogleDocsService],
})
export class GoogleDocsModule {}

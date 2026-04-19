import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { docs_v1, google } from 'googleapis';
import { GoogleOauthService } from '../google-oauth/google-oauth.service';

@Injectable()
export class GoogleDocsService {
  constructor(private readonly googleOAuthService: GoogleOauthService) {}

  async fetchDocument(
    userId: string,
    documentId: string,
  ): Promise<docs_v1.Schema$Document> {
    const auth = await this.googleOAuthService.authorizedClient(userId);
    const docs = google.docs({ version: 'v1', auth });
    try {
      const { data } = await docs.documents.get({ documentId });
      return data;
    } catch (err: unknown) {
      const status =
        (err as { code?: number; response?: { status?: number } })?.response
          ?.status ?? (err as { code?: number })?.code;
      if (status === 404) {
        throw new NotFoundException(`Google Doc ${documentId} not found`);
      }
      if (status === 403) {
        throw new ForbiddenException(
          `Google denied access to ${documentId} for this user`,
        );
      }
      throw err;
    }
  }
}

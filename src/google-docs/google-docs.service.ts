import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { docs_v1, google } from 'googleapis';
import { GoogleDocDto } from 'src/google-docs/dto/google-doc.dto';
import { GoogleOauthService } from 'src/google-oauth/google-oauth.service';

@Injectable()
export class GoogleDocsService {
  constructor(private readonly googleOAuthService: GoogleOauthService) {}

  async fetchDocument(
    userId: string,
    documentId: string,
  ): Promise<GoogleDocDto> {
    const auth = await this.googleOAuthService.authorizedClient(userId);
    const docs = google.docs({ version: 'v1', auth });
    try {
      const { data } = await docs.documents.get({ documentId });
      return this.toDto(data);
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

  private toDto(doc: docs_v1.Schema$Document): GoogleDocDto {
    return {
      id: doc.documentId ?? '',
      title: doc.title ?? '',
      revisionId: doc.revisionId ?? null,
      body: this.extractPlainText(doc.body),
    };
  }

  private extractPlainText(body: docs_v1.Schema$Body | undefined): string {
    if (!body?.content) return '';
    let text = '';
    for (const element of body.content) {
      const paragraphElements = element.paragraph?.elements;
      if (!paragraphElements) continue;
      for (const pe of paragraphElements) {
        if (pe.textRun?.content) text += pe.textRun.content;
      }
    }
    return text;
  }
}

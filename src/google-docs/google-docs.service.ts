import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { google } from 'googleapis';
import {
  GOOGLE_DOC_ID_REGEX,
  TEST_COMMENT_BODY,
} from 'src/google-docs/google-docs.constants';
import { GoogleOauthService } from 'src/google-oauth/google-oauth.service';

export interface PostTestCommentResult {
  commentId: string;
  content: string;
  createdTime: string;
}

@Injectable()
export class GoogleDocsService {
  constructor(private readonly googleOauthService: GoogleOauthService) {}

  async postTestComment(
    userId: string,
    documentUrl: string,
  ): Promise<PostTestCommentResult> {
    const fileId = this.extractFileId(documentUrl);
    const auth = await this.googleOauthService.authorizedClient(userId);
    const drive = google.drive({ version: 'v3', auth });

    const { data } = await drive.comments.create({
      fileId,
      fields: 'id,content,createdTime',
      requestBody: { content: TEST_COMMENT_BODY },
    });

    if (!data.id || !data.content || !data.createdTime) {
      throw new InternalServerErrorException(
        'Drive API returned an incomplete comment response',
      );
    }

    return {
      commentId: data.id,
      content: data.content,
      createdTime: data.createdTime,
    };
  }

  private extractFileId(documentUrl: string): string {
    const match = GOOGLE_DOC_ID_REGEX.exec(documentUrl);
    if (!match) {
      throw new BadRequestException(
        'documentUrl does not look like a Google Doc URL (expected .../document/d/<id>/...)',
      );
    }
    return match[1];
  }
}

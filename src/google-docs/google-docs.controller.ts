import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types';
import { PostTestCommentDto } from 'src/google-docs/dto/post-test-comment.dto';
import { GoogleDocsService } from 'src/google-docs/google-docs.service';

@Controller({ path: 'google-docs', version: '1' })
export class GoogleDocsController {
  constructor(private readonly googleDocsService: GoogleDocsService) {}

  @Post('comments')
  postTestComment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PostTestCommentDto,
  ) {
    return this.googleDocsService.postTestComment(user.id, body.documentUrl);
  }
}

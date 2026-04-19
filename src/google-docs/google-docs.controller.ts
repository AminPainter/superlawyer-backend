import { Controller, Get, Param, Query } from '@nestjs/common';
import { docs_v1 } from 'googleapis';
import { DocsParamsDto, DocsQueryDto } from 'src/google-docs/dto/docs-params.dto';
import { GoogleDocsService } from 'src/google-docs/google-docs.service';

@Controller({ path: 'docs', version: '1' })
export class GoogleDocsController {
  constructor(private readonly googleDocsService: GoogleDocsService) {}

  // TODO: replace `userId` query param with an authenticated session once auth is wired.
  @Get(':docIdOrUrl')
  async read(
    @Param() params: DocsParamsDto,
    @Query() query: DocsQueryDto,
  ): Promise<docs_v1.Schema$Document> {
    return this.googleDocsService.fetchDocument(query.userId, params.docIdOrUrl);
  }
}

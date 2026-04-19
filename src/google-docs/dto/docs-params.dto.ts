import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DOC_ID_REGEX = /^[a-zA-Z0-9_-]{20,}$/;
const DOC_URL_REGEX = /\/document\/d\/([a-zA-Z0-9_-]+)/;

const INVALID_DOC_MESSAGE =
  'Invalid Google Doc ID or URL. Provide the doc ID or a full https://docs.google.com/document/d/<id>/... URL.';

const DocsParamsSchema = z.object({
  docIdOrUrl: z.string().transform((val, ctx) => {
    const decoded = decodeURIComponent(val);
    const fromUrl = decoded.match(DOC_URL_REGEX)?.[1];
    if (fromUrl) return fromUrl;
    if (DOC_ID_REGEX.test(decoded)) return decoded;
    ctx.addIssue({ code: 'custom', message: INVALID_DOC_MESSAGE });
    return z.NEVER;
  }),
});

export class DocsParamsDto extends createZodDto(DocsParamsSchema) {}

const DocsQuerySchema = z.object({
  userId: z.string().min(1, 'userId query parameter is required'),
});

export class DocsQueryDto extends createZodDto(DocsQuerySchema) {}

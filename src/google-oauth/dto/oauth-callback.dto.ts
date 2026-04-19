import { createZodDto, type ZodDto } from 'nestjs-zod';
import { z } from 'zod';

const OauthCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  error: z.string().min(1).optional(),
});

const OauthCallbackQueryBase: ZodDto<typeof OauthCallbackQuerySchema> =
  createZodDto(OauthCallbackQuerySchema);
export class OauthCallbackQueryDto extends OauthCallbackQueryBase {}

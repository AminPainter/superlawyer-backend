import { createZodDto, type ZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PostTestCommentSchema = z.object({
  documentUrl: z.string().min(1),
});

const PostTestCommentBase: ZodDto<typeof PostTestCommentSchema> = createZodDto(
  PostTestCommentSchema,
);
export class PostTestCommentDto extends PostTestCommentBase {}

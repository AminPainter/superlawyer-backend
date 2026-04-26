import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const postTestCommentSchema = z.object({
  documentUrl: z.string().min(1),
});

export class PostTestCommentDto extends createZodDto(postTestCommentSchema) {}

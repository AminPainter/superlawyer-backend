import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4400),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.url(),
  TOKEN_ENCRYPTION_PASSWORD: z
    .string()
    .min(32, 'TOKEN_ENCRYPTION_PASSWORD must be at least 32 characters'),
  FRONTEND_POST_LOGIN_URL: z.url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ISSUER: z.string().min(1).default('superlawyer'),
  JWT_AUDIENCE: z.string().min(1).default('superlawyer-frontend'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  COOKIE_DOMAIN: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.') || '(root)';
        return `  - ${path}: ${issue.message}`;
      })
      .join('\n');

    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return result.data;
}

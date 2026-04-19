import { registerAs } from '@nestjs/config';
import { validateEnv } from 'src/config/env.validation';

export const config = registerAs('config', () => {
  const env = validateEnv(process.env);

  return {
    app: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      frontendPostLoginUrl: env.FRONTEND_POST_LOGIN_URL,
    },
    database: {
      url: env.DATABASE_URL,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
    },
    crypto: {
      password: env.TOKEN_ENCRYPTION_PASSWORD,
    },
  };
});

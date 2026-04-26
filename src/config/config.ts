import { registerAs } from '@nestjs/config';
import { validateEnv } from 'src/config/env.validation';

export const config = registerAs('config', () => {
  const env = validateEnv(process.env);

  return {
    app: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      frontendPostLoginUrl: env.FRONTEND_POST_LOGIN_URL,
      cookieDomain: env.COOKIE_DOMAIN,
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
    jwt: {
      secret: env.JWT_SECRET,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
    },
  };
});

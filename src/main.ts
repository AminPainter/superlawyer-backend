import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from 'src/app/app.module';
import { config } from 'src/config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableVersioning({ type: VersioningType.URI });
  const envConfig = app.get<ConfigType<typeof config>>(config.KEY);

  await app.listen(envConfig.app.port);
}
void bootstrap();

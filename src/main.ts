import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from 'src/app/app.module';
import { ShutdownService } from 'src/app/shutdown.service';
import { AllExceptionsFilter } from 'src/shared/all-exceptions.filter';
import { config } from 'src/config/config';

const SHUTDOWN_DRAIN_MS = 5_000;
const SHUTDOWN_FORCE_MS = 25_000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableVersioning({ type: VersioningType.URI });
  const envConfig = app.get<ConfigType<typeof config>>(config.KEY);
  const shutdown = app.get(ShutdownService);
  const logger = new Logger('Bootstrap');

  await app.listen(envConfig.app.port);

  const drainAndClose = async (signal: NodeJS.Signals) => {
    logger.log(`Received ${signal}, flipping readiness and draining`);
    shutdown.startShutdown();

    const forceExit = setTimeout(() => {
      logger.error(`Forced exit after ${SHUTDOWN_FORCE_MS}ms`);
      process.exit(1);
    }, SHUTDOWN_FORCE_MS);
    forceExit.unref();

    await new Promise<void>((resolve) =>
      setTimeout(resolve, SHUTDOWN_DRAIN_MS),
    );

    try {
      await app.close();
      logger.log('Shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', err as Error);
      process.exit(1);
    }
  };

  process.once('SIGTERM', (s) => void drainAndClose(s));
  process.once('SIGINT', (s) => void drainAndClose(s));
}
void bootstrap();

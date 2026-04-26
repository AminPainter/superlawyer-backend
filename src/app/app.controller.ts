import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ShutdownService } from 'src/app/shutdown.service';

@Controller({ version: '1' })
export class AppController {
  constructor(private readonly shutdown: ShutdownService) {}

  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  readinessCheck() {
    if (this.shutdown.isShuttingDown()) {
      throw new ServiceUnavailableException('shutting down');
    }
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}

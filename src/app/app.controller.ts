import { Controller, Get } from '@nestjs/common';

@Controller({ version: '1' })
export class AppController {
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

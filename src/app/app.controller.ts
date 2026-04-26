import { Controller, Get } from '@nestjs/common';
import { SkipJwtAuthGuard } from 'src/auth/decorators/skip-jwt-auth-guard.decorator';

@Controller({ version: '1' })
export class AppController {
  @SkipJwtAuthGuard()
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

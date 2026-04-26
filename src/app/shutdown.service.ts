import { Injectable } from '@nestjs/common';

@Injectable()
export class ShutdownService {
  private shuttingDown = false;

  startShutdown(): void {
    this.shuttingDown = true;
  }

  isShuttingDown(): boolean {
    return this.shuttingDown;
  }
}

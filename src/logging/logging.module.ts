import { Global, Module } from '@nestjs/common';
import { JsonLogger } from 'src/logging/json-logger.service';

@Global()
@Module({
  providers: [JsonLogger],
  exports: [JsonLogger],
})
export class LoggingModule {}

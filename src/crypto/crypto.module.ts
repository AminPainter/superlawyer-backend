import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from '../config/config';
import { CryptoService } from './crypto.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(config)],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}

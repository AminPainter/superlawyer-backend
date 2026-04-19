import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from 'src/config/config';
import { CryptoService } from 'src/crypto/crypto.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(config)],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}

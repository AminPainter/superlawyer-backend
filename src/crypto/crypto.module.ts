import { Global, Module } from '@nestjs/common';
import { CryptoService } from 'src/crypto/crypto.service';
import { IronCryptoService } from 'src/crypto/iron-crypto.service';

@Global()
@Module({
  providers: [{ provide: CryptoService, useClass: IronCryptoService }],
  exports: [CryptoService],
})
export class CryptoModule {}

import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as Iron from 'iron-webcrypto';
import { config } from 'src/config/config';
import { CryptoService } from 'src/crypto/crypto.service';

@Injectable()
export class IronCryptoService extends CryptoService {
  private readonly password: string;

  constructor(
    @Inject(config.KEY)
    envConfig: ConfigType<typeof config>,
  ) {
    super();
    this.password = envConfig.crypto.password;
  }

  async seal(plaintext: string): Promise<string> {
    return Iron.seal(plaintext, this.password, Iron.defaults);
  }

  async unseal(sealed: string): Promise<string> {
    const result = await Iron.unseal(sealed, this.password, Iron.defaults);
    return result as string;
  }
}

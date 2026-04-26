export abstract class CryptoService {
  abstract seal(plaintext: string): Promise<string>;
  abstract unseal(sealed: string): Promise<string>;
}

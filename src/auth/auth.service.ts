import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedUser, JwtPayload } from 'src/auth/types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  issueAccessToken(user: AuthenticatedUser): {
    token: string;
    maxAgeSeconds: number;
  } {
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const decoded = this.jwtService.decode<JwtPayload | null>(token);
    const maxAgeSeconds = Math.max(
      0,
      (decoded?.exp ?? 0) - Math.floor(Date.now() / 1000),
    );
    return { token, maxAgeSeconds };
  }
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SHOULD_SKIP_JWT_AUTH_GUARD } from 'src/auth/auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SHOULD_SKIP_JWT_AUTH_GUARD,
      [context.getHandler(), context.getClass()],
    );
    if (skip) return true;
    return super.canActivate(context);
  }
}

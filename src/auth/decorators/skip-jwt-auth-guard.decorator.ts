import { SetMetadata } from '@nestjs/common';
import { SHOULD_SKIP_JWT_AUTH_GUARD } from 'src/auth/auth.constants';

export const SkipJwtAuthGuard = () =>
  SetMetadata(SHOULD_SKIP_JWT_AUTH_GUARD, true);

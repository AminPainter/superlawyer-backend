import { Injectable } from '@nestjs/common';
import type { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface UpsertUserInput {
  email: string;
  name?: string | null;
  pictureUrl?: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertByEmail(input: UpsertUserInput): Promise<User> {
    return this.prismaService.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        name: input.name ?? null,
        pictureUrl: input.pictureUrl ?? null,
      },
      update: {
        name: input.name ?? null,
        pictureUrl: input.pictureUrl ?? null,
      },
    });
  }
}

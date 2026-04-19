import { Injectable } from '@nestjs/common';
import type { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertByEmail(args: {
    email: string;
    data: Omit<Prisma.UserUpsertArgs['create'], 'email'>;
  }): Promise<User> {
    return this.prismaService.user.upsert({
      where: { email: args.email },
      create: { email: args.email, ...args.data },
      update: args.data,
    });
  }
}

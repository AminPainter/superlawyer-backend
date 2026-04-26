import { Injectable } from '@nestjs/common';
import { Prisma, type User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export type UpsertUserByEmailInput = Pick<
  Prisma.UserCreateInput,
  'email' | 'name' | 'pictureUrl'
>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async upsertByEmail(
    input: UpsertUserByEmailInput,
    tx: Prisma.TransactionClient = this.prismaService,
  ): Promise<User> {
    return tx.user.upsert({
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

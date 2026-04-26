import { Injectable, Logger } from '@nestjs/common';
import { Prisma, type User } from 'generated/prisma/client';
import {
  UsersRepository,
  type UpsertUserByEmailInput,
} from 'src/users/users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async upsertByEmail(
    input: UpsertUserByEmailInput,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const user = await this.usersRepository.upsertByEmail(input, tx);
    this.logger.log({ message: 'User upserted', userId: user.id });
    return user;
  }
}

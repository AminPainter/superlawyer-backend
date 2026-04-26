import { Injectable } from '@nestjs/common';
import { Prisma, type User } from 'generated/prisma/client';
import {
  UsersRepository,
  type UpsertUserByEmailInput,
} from 'src/users/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async upsertByEmail(
    input: UpsertUserByEmailInput,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    return this.usersRepository.upsertByEmail(input, tx);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}

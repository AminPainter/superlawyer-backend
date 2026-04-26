import { Injectable } from '@nestjs/common';
import { type User } from 'generated/prisma/client';
import {
  UsersRepository,
  type UpsertUserByEmailInput,
} from 'src/users/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async upsertByEmail(input: UpsertUserByEmailInput): Promise<User> {
    return this.usersRepository.upsertByEmail(input);
  }
}

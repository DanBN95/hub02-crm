import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

export interface UpsertUserArgs {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  upsertByGoogle(args: UpsertUserArgs): Promise<User> {
    return this.repo.upsert({
      where: { email: args.email },
      create: {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        googleId: args.googleId,
      },
      update: {
        name: args.name,
        avatarUrl: args.avatarUrl,
        googleId: args.googleId,
      },
    });
  }
}

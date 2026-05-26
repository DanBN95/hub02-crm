import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { UsersService } from '../users/users.service';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateGoogle(profile: GoogleProfile): Promise<User> {
    return this.users.upsertByGoogle(profile);
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }
}

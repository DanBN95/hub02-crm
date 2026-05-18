import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { WorkspacesRepository } from '../workspaces/workspaces.repository';
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
    private readonly workspaces: WorkspacesRepository,
  ) {}

  async validateGoogle(profile: GoogleProfile): Promise<User> {
    const user = await this.users.upsertByGoogle(profile);

    // Auto-provision: if user has no workspace memberships, add them to the first workspace
    const count = await this.workspaces.memberCount(user.id);
    if (count === 0) {
      const workspace = await this.workspaces.findFirst();
      if (workspace) {
        await this.workspaces.addMember(workspace.id, user.id, 'member');
      }
    }

    return user;
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }
}

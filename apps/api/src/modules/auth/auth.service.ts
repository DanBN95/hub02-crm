import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { InvitationsRepository } from '../invitations/invitations.repository';
import { UsersService } from '../users/users.service';
import { WorkspacesRepository } from '../workspaces/workspaces.repository';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly workspaces: WorkspacesRepository,
    private readonly invitations: InvitationsRepository,
  ) {}

  async validateGoogle(profile: GoogleProfile): Promise<User> {
    const user = await this.users.upsertByGoogle(profile);

    const count = await this.workspaces.memberCount(user.id);
    if (count === 0) {
      // Check for a pending invitation matching this email
      const invite = await this.invitations.findPendingByEmail(profile.email);
      if (invite) {
        // Auto-accept: add them to the invited workspace and mark invite used
        await this.workspaces.addMember(invite.workspaceId, user.id, invite.role);
        await this.invitations.markAccepted(invite.id);
        this.logger.log(`Auto-accepted invite for ${profile.email} → workspace ${invite.workspaceId}`);
      } else {
        this.logger.warn(`Google login denied — no invite found for ${profile.email}`);
        // Return user without workspace membership; controller will detect count === 0 and redirect
      }
    }

    return user;
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }
}

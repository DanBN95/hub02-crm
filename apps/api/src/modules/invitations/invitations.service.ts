import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkspacesRepository } from '../workspaces/workspaces.repository';
import { InvitationsRepository } from './invitations.repository';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly repo: InvitationsRepository,
    private readonly workspaces: WorkspacesRepository,
    private readonly config: ConfigService,
  ) {}

  async createInvite(workspaceId: string, email: string, role = 'member') {
    // Idempotent: return existing pending invite for same email
    const existing = await this.repo.findExisting(workspaceId, email);
    if (existing) {
      return this.toResponse(existing);
    }
    const invite = await this.repo.create(workspaceId, email, role);
    return this.toResponse(invite);
  }

  async listPending(workspaceId: string) {
    const invites = await this.repo.findPending(workspaceId);
    return invites.map((i) => this.toResponse(i));
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.repo.findByToken(token);
    if (!invite) throw new NotFoundException('Invitation not found');
    if (invite.acceptedAt) throw new BadRequestException('Invitation already accepted');
    if (invite.expiresAt < new Date()) throw new BadRequestException('Invitation has expired');

    await this.workspaces.addMember(invite.workspaceId, userId, invite.role);
    await this.repo.markAccepted(invite.id);

    return { workspaceId: invite.workspaceId };
  }

  private toResponse(invite: ReturnType<InvitationsRepository['findByToken']> extends Promise<infer T> ? NonNullable<T> : never) {
    const webOrigin = this.config.get<string>('WEB_ORIGIN', 'http://localhost:5173');
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt,
      createdAt: invite.createdAt,
      inviteUrl: `${webOrigin}?invite_token=${invite.token}`,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface InvitationRecord {
  id: string;
  workspaceId: string;
  email: string;
  token: string;
  role: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class InvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, email: string, role = 'member'): Promise<InvitationRecord> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    return this.prisma.workspaceInvitation.create({
      data: { workspaceId, email, role, expiresAt },
    });
  }

  async findPending(workspaceId: string): Promise<InvitationRecord[]> {
    return this.prisma.workspaceInvitation.findMany({
      where: { workspaceId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByToken(token: string): Promise<InvitationRecord | null> {
    return this.prisma.workspaceInvitation.findUnique({ where: { token } });
  }

  async findExisting(workspaceId: string, email: string): Promise<InvitationRecord | null> {
    return this.prisma.workspaceInvitation.findFirst({
      where: { workspaceId, email, acceptedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async markAccepted(id: string): Promise<void> {
    await this.prisma.workspaceInvitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }
}

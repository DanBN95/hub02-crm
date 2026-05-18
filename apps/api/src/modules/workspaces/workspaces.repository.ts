import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

export interface WorkspaceMemberSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMembers(workspaceId: string): Promise<WorkspaceMemberSummary[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => m.user);
  }

  async findFirst(): Promise<{ id: string } | null> {
    return this.prisma.workspace.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } });
  }

  async addMember(workspaceId: string, userId: string, role = 'member'): Promise<void> {
    await this.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId } },
      update: {},
      create: { workspaceId, userId, role },
    });
  }

  async memberCount(userId: string): Promise<number> {
    return this.prisma.workspaceMember.count({ where: { userId } });
  }

  async findForUser(userId: string): Promise<WorkspaceSummary[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => m.workspace);
  }
}

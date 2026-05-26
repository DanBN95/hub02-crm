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
  role: string;
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
    return members.map((m) => ({ ...m.user, role: m.role }));
  }

  async findFirst(): Promise<{ id: string } | null> {
    return this.prisma.workspace.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } });
  }

  async addMember(workspaceId: string, userId: string, role = 'editor'): Promise<void> {
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

  async findMemberRole(workspaceId: string, userId: string): Promise<string | null> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    });
    return member?.role ?? null;
  }

  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<void> {
    await this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role },
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  async createWorkspace(name: string, creatorUserId: string): Promise<WorkspaceSummary> {
    const slug = name.toLowerCase().replace(/\s+/g, '-').trim();
    const workspace = await this.prisma.workspace.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true },
    });
    await this.prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: creatorUserId, role: 'admin' },
    });
    return workspace;
  }

  async updateWorkspaceName(workspaceId: string, name: string): Promise<WorkspaceSummary> {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name },
      select: { id: true, name: true, slug: true },
    });
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }
}

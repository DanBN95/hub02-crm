import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string): Promise<WorkspaceSummary[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => m.workspace);
  }
}

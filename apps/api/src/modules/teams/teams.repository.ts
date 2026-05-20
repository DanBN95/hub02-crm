import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TeamWithCount {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  _count: { tasks: number };
}

const DEFAULT_TEAMS = [
  { name: 'General',    color: '#7c7ff5' },
  { name: 'Marketing',  color: '#e07b54' },
  { name: 'Design',     color: '#54b8e0' },
  { name: 'Technology', color: '#54e09e' },
] as const;

@Injectable()
export class TeamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(workspaceId: string): Promise<TeamWithCount[]> {
    const count = await this.prisma.team.count({ where: { workspaceId } });

    if (count === 0) {
      await this.prisma.team.createMany({
        data: DEFAULT_TEAMS.map((t) => ({ ...t, workspaceId })),
        skipDuplicates: true,
      });
    }

    return this.prisma.team.findMany({
      where: { workspaceId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(workspaceId: string, name: string, color = '#7c7ff5'): Promise<TeamWithCount> {
    return this.prisma.team.create({
      data: { workspaceId, name, color },
      include: { _count: { select: { tasks: true } } },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TeamMemberRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface TeamWithDetails {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  _count: { tasks: number };
  members: TeamMemberRecord[];
}

const DEFAULT_TEAMS = [
  { name: 'General',    color: '#7c7ff5' },
  { name: 'Marketing',  color: '#e07b54' },
  { name: 'Design',     color: '#54b8e0' },
  { name: 'Technology', color: '#54e09e' },
] as const;

const MEMBER_SELECT = { id: true, name: true, email: true, avatarUrl: true } as const;

@Injectable()
export class TeamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(workspaceId: string): Promise<TeamWithDetails[]> {
    const count = await this.prisma.team.count({ where: { workspaceId } });

    if (count === 0) {
      await this.prisma.team.createMany({
        data: DEFAULT_TEAMS.map((t) => ({ ...t, workspaceId })),
        skipDuplicates: true,
      });
    }

    return this.prisma.team.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { tasks: true } },
        members: { include: { user: { select: MEMBER_SELECT } } },
      },
      orderBy: { createdAt: 'asc' },
    }).then((teams) =>
      teams.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        createdAt: t.createdAt,
        _count: t._count,
        members: t.members.map((m) => m.user),
      }))
    );
  }

  create(workspaceId: string, name: string, color = '#7c7ff5'): Promise<TeamWithDetails> {
    return this.prisma.team.create({
      data: { workspaceId, name, color },
      include: {
        _count: { select: { tasks: true } },
        members: { include: { user: { select: MEMBER_SELECT } } },
      },
    }).then((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      createdAt: t.createdAt,
      _count: t._count,
      members: t.members.map((m) => m.user),
    }));
  }

  addMember(teamId: string, userId: string) {
    return this.prisma.teamMember.create({ data: { teamId, userId } });
  }

  removeMember(teamId: string, userId: string) {
    return this.prisma.teamMember.deleteMany({ where: { teamId, userId } });
  }
}

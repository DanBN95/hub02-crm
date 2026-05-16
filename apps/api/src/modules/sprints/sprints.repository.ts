import { Injectable } from '@nestjs/common';
import type { Prisma, Sprint } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SprintsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(workspaceId: string): Promise<Sprint[]> {
    return this.prisma.sprint.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<Sprint | null> {
    return this.prisma.sprint.findUnique({ where: { id } });
  }

  create(workspaceId: string, data: Prisma.SprintCreateInput): Promise<Sprint> {
    return this.prisma.sprint.create({ data });
  }

  update(id: string, data: Prisma.SprintUpdateInput): Promise<Sprint> {
    return this.prisma.sprint.update({ where: { id }, data });
  }

  delete(id: string): Promise<Sprint> {
    return this.prisma.sprint.delete({ where: { id } });
  }

  async setActive(workspaceId: string, id: string): Promise<Sprint> {
    const [, sprint] = await this.prisma.$transaction([
      this.prisma.sprint.updateMany({
        where: { workspaceId, isActive: true },
        data: { isActive: false },
      }),
      this.prisma.sprint.update({ where: { id }, data: { isActive: true } }),
    ]);
    return sprint;
  }
}

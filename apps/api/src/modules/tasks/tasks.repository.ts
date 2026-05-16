import { Injectable } from '@nestjs/common';
import type { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { TaskFiltersDto } from './dto/task-filters.dto';

export const taskWithRelations = {
  assignee: { select: { id: true, name: true, avatarUrl: true, email: true } },
  sprint: { select: { id: true, name: true } },
} satisfies Prisma.TaskInclude;

export type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof taskWithRelations }>;

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    workspaceId: string,
    filters: TaskFiltersDto,
  ): Promise<{ items: TaskWithRelations[]; nextCursor: string | null; total: number }> {
    const { cursor, limit = 50, orderBy = 'position', order = 'asc', q, ...where } = filters;

    const whereClause: Prisma.TaskWhereInput = {
      workspaceId,
      ...where,
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.task.count({ where: whereClause }),
      this.prisma.task.findMany({
        where: whereClause,
        include: taskWithRelations,
        orderBy: { [orderBy]: order },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
    ]);

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const last = items.pop();
      nextCursor = last?.id ?? null;
    }

    return { items, nextCursor, total };
  }

  findById(id: string): Promise<TaskWithRelations | null> {
    return this.prisma.task.findUnique({ where: { id }, include: taskWithRelations });
  }

  async create(workspaceId: string, data: Prisma.TaskCreateInput): Promise<TaskWithRelations> {
    const maxPos = await this.prisma.task.aggregate({
      where: { workspaceId },
      _max: { position: true },
    });
    return this.prisma.task.create({
      data: { ...data, position: (maxPos._max.position ?? -1) + 1 },
      include: taskWithRelations,
    });
  }

  update(id: string, data: Prisma.TaskUpdateInput): Promise<TaskWithRelations> {
    return this.prisma.task.update({ where: { id }, data, include: taskWithRelations });
  }

  delete(id: string): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
    const result = await this.prisma.task.updateMany({
      where: { id: { in: ids } },
      data: { status: status as Parameters<typeof this.prisma.task.updateMany>[0]['data']['status'] },
    });
    return result.count;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const result = await this.prisma.task.deleteMany({ where: { id: { in: ids } } });
    return result.count;
  }

  async getBoardColumns(
    workspaceId: string,
    sprintId: string,
  ): Promise<Record<string, TaskWithRelations[]>> {
    const tasks = await this.prisma.task.findMany({
      where: { workspaceId, sprintId },
      include: taskWithRelations,
      orderBy: { position: 'asc' },
    });
    const columns: Record<string, TaskWithRelations[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    for (const task of tasks) {
      const col = columns[task.status];
      if (col) col.push(task);
    }
    return columns;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Priority, Status } from '@prisma/client';
import type { TaskFiltersDto } from './dto/task-filters.dto';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository, type TaskWithRelations } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly repo: TasksRepository) {}

  list(workspaceId: string, filters: TaskFiltersDto) {
    return this.repo.findMany(workspaceId, filters);
  }

  async findOne(id: string): Promise<TaskWithRelations> {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(workspaceId: string, dto: CreateTaskDto, creatorId: string): Promise<TaskWithRelations> {
    return this.repo.create(workspaceId, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority ?? Priority.P2,
      status: dto.status ?? Status.BACKLOG,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      workspace: { connect: { id: workspaceId } },
      ...(dto.sprintId ? { sprint: { connect: { id: dto.sprintId } } } : {}),
      ...(dto.assigneeId ? { assignee: { connect: { id: dto.assigneeId } } } : {}),
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskWithRelations> {
    await this.findOne(id);
    return this.repo.update(id, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.dueAt !== undefined ? { dueAt: dto.dueAt ? new Date(dto.dueAt) : null } : {}),
      ...(dto.sprintId !== undefined
        ? dto.sprintId
          ? { sprint: { connect: { id: dto.sprintId } } }
          : { sprint: { disconnect: true } }
        : {}),
      ...(dto.assigneeId !== undefined
        ? dto.assigneeId
          ? { assignee: { connect: { id: dto.assigneeId } } }
          : { assignee: { disconnect: true } }
        : {}),
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  bulkUpdateStatus(ids: string[], status: Status) {
    return this.repo.bulkUpdateStatus(ids, status);
  }

  bulkDelete(ids: string[]) {
    return this.repo.bulkDelete(ids);
  }
}

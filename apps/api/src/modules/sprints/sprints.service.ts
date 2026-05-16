import { Injectable, NotFoundException } from '@nestjs/common';
import type { Sprint } from '@prisma/client';
import type { CreateSprintDto } from './dto/create-sprint.dto';
import type { UpdateSprintDto } from './dto/update-sprint.dto';
import { SprintsRepository } from './sprints.repository';

@Injectable()
export class SprintsService {
  constructor(private readonly repo: SprintsRepository) {}

  list(workspaceId: string): Promise<Sprint[]> {
    return this.repo.findMany(workspaceId);
  }

  async findOne(id: string): Promise<Sprint> {
    const sprint = await this.repo.findById(id);
    if (!sprint) throw new NotFoundException(`Sprint ${id} not found`);
    return sprint;
  }

  create(workspaceId: string, dto: CreateSprintDto): Promise<Sprint> {
    return this.repo.create(workspaceId, {
      name: dto.name,
      ...(dto.goal ? { goal: dto.goal } : {}),
      ...(dto.startsAt ? { startsAt: new Date(dto.startsAt) } : {}),
      ...(dto.endsAt ? { endsAt: new Date(dto.endsAt) } : {}),
      workspace: { connect: { id: workspaceId } },
    });
  }

  async update(id: string, dto: UpdateSprintDto): Promise<Sprint> {
    await this.findOne(id);
    return this.repo.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.goal !== undefined ? { goal: dto.goal } : {}),
      ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null } : {}),
      ...(dto.endsAt !== undefined ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null } : {}),
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async setActive(workspaceId: string, id: string): Promise<Sprint> {
    await this.findOne(id);
    return this.repo.setActive(workspaceId, id);
  }
}

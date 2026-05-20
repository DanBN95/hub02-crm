import { ConflictException, Injectable } from '@nestjs/common';
import type { CreateTeamDto } from './dto/create-team.dto';
import { TeamsRepository } from './teams.repository';

@Injectable()
export class TeamsService {
  constructor(private readonly repo: TeamsRepository) {}

  list(workspaceId: string) {
    return this.repo.findMany(workspaceId);
  }

  async create(workspaceId: string, dto: CreateTeamDto) {
    try {
      return await this.repo.create(workspaceId, dto.name, dto.color);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException(`A group named "${dto.name}" already exists.`);
      }
      throw err;
    }
  }
}

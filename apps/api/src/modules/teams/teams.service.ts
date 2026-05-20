import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async addMember(teamId: string, userId: string) {
    try {
      return await this.repo.addMember(teamId, userId);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('User is already a member of this group.');
      }
      if (err?.code === 'P2025') {
        throw new NotFoundException('Team or user not found.');
      }
      throw err;
    }
  }

  removeMember(teamId: string, userId: string) {
    return this.repo.removeMember(teamId, userId);
  }
}

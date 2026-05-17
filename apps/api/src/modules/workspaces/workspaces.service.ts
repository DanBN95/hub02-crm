import { Injectable } from '@nestjs/common';
import { WorkspacesRepository, type WorkspaceSummary } from './workspaces.repository';

@Injectable()
export class WorkspacesService {
  constructor(private readonly repo: WorkspacesRepository) {}

  findForUser(userId: string): Promise<WorkspaceSummary[]> {
    return this.repo.findForUser(userId);
  }
}

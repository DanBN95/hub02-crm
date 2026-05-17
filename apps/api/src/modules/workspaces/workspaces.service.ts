import { Injectable } from '@nestjs/common';
import { WorkspacesRepository, type WorkspaceMemberSummary, type WorkspaceSummary } from './workspaces.repository';

@Injectable()
export class WorkspacesService {
  constructor(private readonly repo: WorkspacesRepository) {}

  findForUser(userId: string): Promise<WorkspaceSummary[]> {
    return this.repo.findForUser(userId);
  }

  findMembers(workspaceId: string): Promise<WorkspaceMemberSummary[]> {
    return this.repo.findMembers(workspaceId);
  }
}

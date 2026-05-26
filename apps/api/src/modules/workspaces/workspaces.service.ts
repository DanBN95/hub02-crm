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

  findMemberRole(workspaceId: string, userId: string): Promise<string | null> {
    return this.repo.findMemberRole(workspaceId, userId);
  }

  updateMemberRole(workspaceId: string, userId: string, role: string): Promise<void> {
    return this.repo.updateMemberRole(workspaceId, userId, role);
  }

  removeMember(workspaceId: string, userId: string): Promise<void> {
    return this.repo.removeMember(workspaceId, userId);
  }

  createWorkspace(name: string, creatorUserId: string): Promise<WorkspaceSummary> {
    return this.repo.createWorkspace(name, creatorUserId);
  }

  updateWorkspaceName(workspaceId: string, name: string): Promise<WorkspaceSummary> {
    return this.repo.updateWorkspaceName(workspaceId, name);
  }

  deleteWorkspace(workspaceId: string): Promise<void> {
    return this.repo.deleteWorkspace(workspaceId);
  }
}

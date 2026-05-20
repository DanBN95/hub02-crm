import { apiClient } from '../../lib/api-client';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  _count: { tasks: number };
  members: TeamMember[];
}

export interface CreateTeamDto {
  name: string;
  color?: string;
}

export const teamsApi = {
  list: (workspaceId: string): Promise<Team[]> =>
    apiClient.get(`/workspaces/${workspaceId}/teams`).then((r) => r.data as Team[]),

  create: (workspaceId: string, dto: CreateTeamDto): Promise<Team> =>
    apiClient.post(`/workspaces/${workspaceId}/teams`, dto).then((r) => r.data as Team),

  addMember: (workspaceId: string, teamId: string, userId: string): Promise<void> =>
    apiClient.post(`/workspaces/${workspaceId}/teams/${teamId}/members`, { userId }).then(() => undefined),

  removeMember: (workspaceId: string, teamId: string, userId: string): Promise<void> =>
    apiClient.delete(`/workspaces/${workspaceId}/teams/${teamId}/members/${userId}`).then(() => undefined),
};

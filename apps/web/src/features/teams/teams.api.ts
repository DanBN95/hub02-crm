import { apiClient } from '../../lib/api-client';

export interface Team {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  _count: { tasks: number };
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
};

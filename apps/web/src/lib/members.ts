import { apiClient } from './api-client';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export const membersApi = {
  list: (workspaceId: string): Promise<Member[]> =>
    apiClient.get(`/workspaces/${workspaceId}/members`).then((r) => r.data as Member[]),
};

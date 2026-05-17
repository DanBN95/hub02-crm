import { apiClient } from './api-client';

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

export const workspacesApi = {
  list: (): Promise<WorkspaceSummary[]> =>
    apiClient.get('/workspaces').then((r) => r.data as WorkspaceSummary[]),
};

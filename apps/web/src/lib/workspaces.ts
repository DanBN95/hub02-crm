import { apiClient } from './api-client';

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

export const workspacesApi = {
  list: () => apiClient.get('/workspaces').then((r) => r.data as WorkspaceSummary[]),
  create: (name: string) => apiClient.post('/workspaces', { name }).then((r) => r.data as WorkspaceSummary),
  updateName: (workspaceId: string, name: string) =>
    apiClient.patch(`/workspaces/${workspaceId}/name`, { name }).then((r) => r.data as WorkspaceSummary),
  delete: (workspaceId: string) => apiClient.delete(`/workspaces/${workspaceId}`),
  members: (workspaceId: string) =>
    apiClient.get(`/workspaces/${workspaceId}/members`).then((r) => r.data as WorkspaceMember[]),
  updateMemberRole: (workspaceId: string, userId: string, role: string) =>
    apiClient.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role }).then((r) => r.data),
  removeMember: (workspaceId: string, userId: string) =>
    apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`),
};

import type { CreateSprintDto, Sprint, UpdateSprintDto } from '@hub02/shared';
import { apiClient } from '../../lib/api-client';

export const sprintsApi = {
  list: (workspaceId: string): Promise<Sprint[]> =>
    apiClient.get(`/workspaces/${workspaceId}/sprints`).then((r) => r.data as Sprint[]),

  get: (id: string): Promise<Sprint> =>
    apiClient.get(`/sprints/${id}`).then((r) => r.data as Sprint),

  create: (workspaceId: string, dto: CreateSprintDto): Promise<Sprint> =>
    apiClient.post(`/workspaces/${workspaceId}/sprints`, dto).then((r) => r.data as Sprint),

  update: (id: string, dto: UpdateSprintDto): Promise<Sprint> =>
    apiClient.patch(`/sprints/${id}`, dto).then((r) => r.data as Sprint),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/sprints/${id}`).then(() => undefined),

  activate: (workspaceId: string, id: string): Promise<Sprint> =>
    apiClient.patch(`/workspaces/${workspaceId}/sprints/${id}/activate`).then((r) => r.data as Sprint),
};

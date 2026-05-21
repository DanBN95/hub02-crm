import type { Task, CreateTaskDto, UpdateTaskDto } from '@hub02/shared';
import { apiClient } from '../../lib/api-client';

export interface TaskWithRelations extends Omit<Task, 'dueAt' | 'description'> {
  assignee: { id: string; name: string; avatarUrl: string | null; email: string } | null;
  sprint: { id: string; name: string } | null;
  team: { id: string; name: string; color: string } | null;
  dueAt?: string | null;
  description?: string | null;
}

export interface TasksPage {
  items: TaskWithRelations[];
  nextCursor: string | null;
  total: number;
}

export interface TaskFilters {
  sprintId?: string;
  assigneeId?: string;
  teamId?: string;
  status?: string;
  priority?: string;
  cursor?: string;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  q?: string;
}

export const tasksApi = {
  list: (workspaceId: string, filters: TaskFilters = {}): Promise<TasksPage> =>
    apiClient.get(`/workspaces/${workspaceId}/tasks`, { params: filters }).then((r) => r.data as TasksPage),

  get: (id: string): Promise<TaskWithRelations> =>
    apiClient.get(`/tasks/${id}`).then((r) => r.data as TaskWithRelations),

  create: (workspaceId: string, dto: CreateTaskDto): Promise<TaskWithRelations> =>
    apiClient.post(`/workspaces/${workspaceId}/tasks`, dto).then((r) => r.data as TaskWithRelations),

  update: (id: string, dto: UpdateTaskDto): Promise<TaskWithRelations> =>
    apiClient.patch(`/tasks/${id}`, dto).then((r) => r.data as TaskWithRelations),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/tasks/${id}`).then(() => undefined),

  bulkStatus: (workspaceId: string, ids: string[], status: string): Promise<number> =>
    apiClient.patch(`/workspaces/${workspaceId}/tasks/bulk-status`, { ids, status }).then((r) => r.data as number),

  bulkDelete: (workspaceId: string, ids: string[]): Promise<void> =>
    apiClient.delete(`/workspaces/${workspaceId}/tasks/bulk`, { data: { ids } }).then(() => undefined),

  getBoardColumns: (workspaceId: string, sprintId: string): Promise<Record<string, TaskWithRelations[]>> =>
    apiClient.get(`/workspaces/${workspaceId}/sprints/${sprintId}/board`).then((r) => r.data as Record<string, TaskWithRelations[]>),
};

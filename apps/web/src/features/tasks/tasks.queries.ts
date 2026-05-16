import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTaskDto, UpdateTaskDto } from '@hub02/shared';
import { tasksApi, type TaskFilters } from './tasks.api';

const TASKS_KEY = (workspaceId: string, filters?: TaskFilters) =>
  ['tasks', workspaceId, filters] as const;

const TASK_KEY = (id: string) => ['task', id] as const;

export function useTasksList(workspaceId: string, filters: TaskFilters = {}) {
  return useQuery({
    queryKey: TASKS_KEY(workspaceId, filters),
    queryFn: () => tasksApi.list(workspaceId, filters),
    staleTime: 30_000,
    enabled: !!workspaceId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEY(id),
    queryFn: () => tasksApi.get(id),
    staleTime: 0,
  });
}

export function useCreateTask(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksApi.create(workspaceId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    },
  });
}

export function useUpdateTask(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) => tasksApi.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await qc.cancelQueries({ queryKey: ['tasks', workspaceId] });
      const prev = qc.getQueryData(TASKS_KEY(workspaceId));
      qc.setQueriesData({ queryKey: ['tasks', workspaceId] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const page = old as { items: Array<{ id: string }> };
        return {
          ...page,
          items: page.items.map((t) => (t.id === id ? { ...t, ...dto } : t)),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(TASKS_KEY(workspaceId), ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    },
  });
}

export function useDeleteTask(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    },
  });
}

export function useBulkStatus(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      tasksApi.bulkStatus(workspaceId, ids, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tasks', workspaceId] }),
  });
}

export function useBulkDelete(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => tasksApi.bulkDelete(workspaceId, ids),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tasks', workspaceId] }),
  });
}

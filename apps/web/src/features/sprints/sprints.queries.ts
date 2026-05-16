import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSprintDto, UpdateSprintDto } from '@hub02/shared';
import { sprintsApi } from './sprints.api';

const SPRINTS_KEY = (workspaceId: string) => ['sprints', workspaceId] as const;
const SPRINT_KEY = (id: string) => ['sprint', id] as const;

export function useSprintsList(workspaceId: string) {
  return useQuery({
    queryKey: SPRINTS_KEY(workspaceId),
    queryFn: () => sprintsApi.list(workspaceId),
    staleTime: 30_000,
    enabled: !!workspaceId,
  });
}

export function useSprint(id: string) {
  return useQuery({
    queryKey: SPRINT_KEY(id),
    queryFn: () => sprintsApi.get(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useCreateSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSprintDto) => sprintsApi.create(workspaceId, dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SPRINTS_KEY(workspaceId) }),
  });
}

export function useUpdateSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSprintDto }) => sprintsApi.update(id, dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SPRINTS_KEY(workspaceId) }),
  });
}

export function useDeleteSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintsApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SPRINTS_KEY(workspaceId) }),
  });
}

export function useActivateSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintsApi.activate(workspaceId, id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: SPRINTS_KEY(workspaceId) }),
  });
}

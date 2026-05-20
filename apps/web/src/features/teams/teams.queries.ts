import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type CreateTeamDto, teamsApi } from './teams.api';

export function useTeamsList(workspaceId: string) {
  return useQuery({
    queryKey: ['teams', workspaceId],
    queryFn: () => teamsApi.list(workspaceId),
    staleTime: 60_000,
    enabled: !!workspaceId,
  });
}

export function useCreateTeam(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTeamDto) => teamsApi.create(workspaceId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', workspaceId] }),
  });
}

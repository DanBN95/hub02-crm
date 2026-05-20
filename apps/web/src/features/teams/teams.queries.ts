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

export function useAddTeamMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsApi.addMember(workspaceId, teamId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', workspaceId] }),
  });
}

export function useRemoveTeamMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsApi.removeMember(workspaceId, teamId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', workspaceId] }),
  });
}

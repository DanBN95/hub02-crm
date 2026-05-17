import { useQuery } from '@tanstack/react-query';
import { membersApi } from './members';

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => membersApi.list(workspaceId),
    staleTime: 60_000,
    enabled: !!workspaceId,
  });
}

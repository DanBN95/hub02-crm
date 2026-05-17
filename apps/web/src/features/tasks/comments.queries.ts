import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsApi, type Comment } from './comments.api';

export const commentKeys = {
  list: (taskId: string) => ['comments', taskId] as const,
};

export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () => commentsApi.list(taskId),
    enabled: !!taskId,
    staleTime: 10_000,
  });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsApi.create(taskId, content),
    onSuccess: (comment) => {
      qc.setQueryData<Comment[]>(commentKeys.list(taskId), (old = []) => [...old, comment]);
    },
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(commentId),
    onSuccess: (_, commentId) => {
      qc.setQueryData<Comment[]>(commentKeys.list(taskId), (old = []) =>
        old.filter((c) => c.id !== commentId),
      );
    },
  });
}

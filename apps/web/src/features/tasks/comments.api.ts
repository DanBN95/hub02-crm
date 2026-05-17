import { apiClient } from '../../lib/api-client';

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatarUrl: string | null; email: string };
}

export const commentsApi = {
  list: (taskId: string): Promise<Comment[]> =>
    apiClient.get(`/tasks/${taskId}/comments`).then((r) => r.data as Comment[]),

  create: (taskId: string, content: string): Promise<Comment> =>
    apiClient.post(`/tasks/${taskId}/comments`, { content }).then((r) => r.data as Comment),

  delete: (commentId: string): Promise<void> =>
    apiClient.delete(`/comments/${commentId}`).then(() => undefined),
};

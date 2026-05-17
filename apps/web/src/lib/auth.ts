import { apiClient } from './api-client';

export interface Me {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export const authApi = {
  me: (): Promise<Me> => apiClient.get('/auth/me').then((r) => r.data as Me),
  devLogin: (): Promise<{ ok: boolean; userId: string }> =>
    apiClient.post('/auth/dev-login').then((r) => r.data as { ok: boolean; userId: string }),
  logout: (): Promise<void> => apiClient.post('/auth/logout').then(() => undefined),
};

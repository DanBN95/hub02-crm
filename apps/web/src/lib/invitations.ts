import { apiClient } from './api-client';

export interface InvitationSummary {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  inviteUrl: string;
}

export const invitationsApi = {
  create: (workspaceId: string, email: string, role = 'member'): Promise<InvitationSummary> =>
    apiClient
      .post(`/workspaces/${workspaceId}/invitations`, { email, role })
      .then((r) => r.data as InvitationSummary),

  list: (workspaceId: string): Promise<InvitationSummary[]> =>
    apiClient
      .get(`/workspaces/${workspaceId}/invitations`)
      .then((r) => r.data as InvitationSummary[]),

  accept: (token: string): Promise<{ workspaceId: string }> =>
    apiClient
      .post(`/invitations/${token}/accept`)
      .then((r) => r.data as { workspaceId: string }),
};

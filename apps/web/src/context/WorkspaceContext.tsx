import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../lib/auth';
import { invitationsApi } from '../lib/invitations';
import { workspacesApi, type WorkspaceSummary } from '../lib/workspaces';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface WorkspaceState {
  workspace: WorkspaceSummary | null;
  user: CurrentUser | null;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceState>({
  workspace: null,
  user: null,
  loading: true,
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

const INVITE_TOKEN_KEY = 'hub02_pending_invite';

/** Stash invite token from URL into localStorage so it survives the Google OAuth redirect. */
function stashInviteToken() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('invite_token');
  if (token) {
    localStorage.setItem(INVITE_TOKEN_KEY, token);
    // Clean the param from the URL without a page reload
    params.delete('invite_token');
    const newSearch = params.toString();
    window.history.replaceState(null, '', newSearch ? `?${newSearch}` : window.location.pathname);
  }
}

async function acceptPendingInvite() {
  const token = localStorage.getItem(INVITE_TOKEN_KEY);
  if (!token) return;
  try {
    await invitationsApi.accept(token);
  } catch {
    // Expired / already accepted — ignore, just clear it
  } finally {
    localStorage.removeItem(INVITE_TOKEN_KEY);
  }
}

async function bootstrap(): Promise<{ workspace: WorkspaceSummary | null; user: CurrentUser | null }> {
  stashInviteToken();

  // Try to authenticate
  let user: CurrentUser | null = null;
  try {
    user = (await authApi.me()) as CurrentUser;
  } catch {
    try {
      await authApi.devLogin();
      user = (await authApi.me()) as CurrentUser;
    } catch {
      return { workspace: null, user: null };
    }
  }

  // Accept any pending invite now that we're authenticated
  await acceptPendingInvite();

  try {
    const workspaces = await workspacesApi.list();
    return { workspace: workspaces[0] ?? null, user };
  } catch {
    return { workspace: null, user };
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({ workspace: null, user: null, loading: true });

  useEffect(() => {
    bootstrap()
      .then(({ workspace, user }) => setState({ workspace, user, loading: false }))
      .catch(() => setState({ workspace: null, user: null, loading: false }));
  }, []);

  return <WorkspaceContext.Provider value={state}>{children}</WorkspaceContext.Provider>;
}

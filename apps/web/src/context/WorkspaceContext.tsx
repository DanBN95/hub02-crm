import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../lib/auth';
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
  role: string | null;
  refresh: () => void;
}

const WorkspaceContext = createContext<WorkspaceState>({
  workspace: null,
  user: null,
  loading: true,
  role: null,
  refresh: () => undefined,
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

async function bootstrap(): Promise<{ workspace: WorkspaceSummary | null; user: CurrentUser | null; role: string | null }> {
  // Check for ?onboard=1 — user just signed up with no workspace
  const params = new URLSearchParams(window.location.search);
  const onboard = params.get('onboard') === '1';

  // Try to authenticate
  let user: CurrentUser | null = null;
  try {
    user = (await authApi.me()) as CurrentUser;
  } catch {
    return { workspace: null, user: null, role: null };
  }

  // If ?onboard=1 and user is authenticated, show create-workspace screen
  if (onboard && user) {
    return { workspace: null, user, role: null };
  }

  try {
    const workspaces = await workspacesApi.list();
    const workspace = workspaces[0] ?? null;

    let role: string | null = null;
    if (workspace && user) {
      const members = await workspacesApi.members(workspace.id);
      const member = members.find((m) => m.id === user!.id);
      role = member?.role ?? null;
    }

    return { workspace, user, role };
  } catch {
    return { workspace: null, user, role: null };
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<WorkspaceState, 'refresh'>>({
    workspace: null,
    user: null,
    loading: true,
    role: null,
  });
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    bootstrap()
      .then(({ workspace, user, role }) => setState({ workspace, user, loading: false, role }))
      .catch(() => setState({ workspace: null, user: null, loading: false, role: null }));
  }, [tick]);

  return (
    <WorkspaceContext.Provider value={{ ...state, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

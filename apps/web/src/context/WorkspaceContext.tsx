import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../lib/auth';
import { workspacesApi, type WorkspaceSummary } from '../lib/workspaces';

interface WorkspaceState {
  workspace: WorkspaceSummary | null;
  loading: boolean;
  error: string | null;
}

const WorkspaceContext = createContext<WorkspaceState>({
  workspace: null,
  loading: true,
  error: null,
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

const IS_DEV = import.meta.env.DEV;

async function bootstrap(): Promise<WorkspaceSummary | null> {
  try {
    await authApi.me();
  } catch {
    if (!IS_DEV) return null;
    try {
      await authApi.devLogin();
    } catch {
      return null;
    }
  }
  try {
    const workspaces = await workspacesApi.list();
    return workspaces[0] ?? null;
  } catch {
    return null;
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({ workspace: null, loading: true, error: null });

  useEffect(() => {
    bootstrap()
      .then((workspace) => setState({ workspace, loading: false, error: null }))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load workspace';
        setState({ workspace: null, loading: false, error: msg });
      });
  }, []);

  return <WorkspaceContext.Provider value={state}>{children}</WorkspaceContext.Provider>;
}

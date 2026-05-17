import { useState } from 'react';
import { Sidebar, type NavKey } from './components/layout/Sidebar';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { DocumentsView } from './features/documents/components/DocumentsView';
import { SprintsTable } from './features/sprints/components/SprintsTable';
import { TasksView } from './features/tasks/components/TasksView';

function AppShell() {
  const [nav, setNav] = useState<NavKey>('tasks');
  const { workspace, loading, error } = useWorkspace();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[var(--color-bg)] flex items-center justify-center">
        <span className="text-[13px] text-[var(--color-fg-muted)]">Loading…</span>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="h-screen w-screen bg-[var(--color-bg)] flex items-center justify-center">
        <span className="text-[13px] text-[var(--color-danger)]">
          {error ?? 'Could not connect to workspace'}
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[var(--color-bg)] text-[var(--color-fg)] flex overflow-hidden">
      <Sidebar active={nav} onSelect={setNav} />
      <main className="flex-1 min-w-0 overflow-hidden">
        {nav === 'tasks' && <TasksView workspaceId={workspace.id} />}
        {nav === 'sprints' && <SprintsTable workspaceId={workspace.id} />}
        {nav === 'documents' && <DocumentsView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}

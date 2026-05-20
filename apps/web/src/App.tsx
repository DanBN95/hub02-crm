import { useState } from 'react';
import { CommandPalette } from './components/CommandPalette';
import { Sidebar, type NavKey } from './components/layout/Sidebar';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LoginPage } from './features/auth/LoginPage';
import { DocumentsView } from './features/documents/components/DocumentsView';
import { TeamsView } from './features/teams/TeamsView';
import { HomeView } from './features/home/HomeView';
import { WorkspaceSettings } from './features/settings/WorkspaceSettings';
import { SprintsTable } from './features/sprints/components/SprintsTable';
import { TasksView } from './features/tasks/components/TasksView';
import { useCommandPalette } from './hooks/useCommandPalette';

function AppShell() {
  const [nav, setNav] = useState<NavKey>('home');
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const { workspace, user, loading } = useWorkspace();
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[var(--color-bg)] flex items-center justify-center">
        <span className="text-[13px] text-[var(--color-fg-muted)]">Loading…</span>
      </div>
    );
  }

  if (!workspace) {
    return <LoginPage />;
  }

  function handleOpenTask(taskId: string) {
    setNav('tasks');
    setDetailTaskId(taskId);
  }

  return (
    <div className="h-screen w-screen bg-[var(--color-bg)] text-[var(--color-fg)] flex overflow-hidden">
      <Sidebar active={nav} onSelect={setNav} />
      <main className="flex-1 min-w-0 overflow-hidden">
        {nav === 'home' && (
          <HomeView workspaceId={workspace.id} userId={user?.id ?? ''} />
        )}
        {nav === 'tasks' && (
          <TasksView
            workspaceId={workspace.id}
            externalDetailTaskId={detailTaskId}
            onExternalDetailClose={() => setDetailTaskId(null)}
          />
        )}
        {nav === 'sprints' && <SprintsTable workspaceId={workspace.id} />}
        {nav === 'teams' && <TeamsView workspaceId={workspace.id} />}
        {nav === 'documents' && <DocumentsView />}
        {nav === 'settings' && (
          <WorkspaceSettings workspaceId={workspace.id} workspaceName={workspace.name} />
        )}
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        workspaceId={workspace.id}
        onOpenTask={handleOpenTask}
        onNavigate={setNav}
      />
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

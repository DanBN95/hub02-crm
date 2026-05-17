import { useState } from 'react';
import { Sidebar, type NavKey } from './components/layout/Sidebar';
import { DocumentsView } from './features/documents/components/DocumentsView';
import { SprintsTable } from './features/sprints/components/SprintsTable';
import { TasksView } from './features/tasks/components/TasksView';

export default function App() {
  const [nav, setNav] = useState<NavKey>('tasks');

  return (
    <div className="h-screen w-screen bg-[var(--color-bg)] text-[var(--color-fg)] flex overflow-hidden">
      <Sidebar active={nav} onSelect={setNav} />
      <main className="flex-1 min-w-0 overflow-hidden">
        {nav === 'tasks' && <TasksView />}
        {nav === 'sprints' && <SprintsTable />}
        {nav === 'documents' && <DocumentsView />}
      </main>
    </div>
  );
}

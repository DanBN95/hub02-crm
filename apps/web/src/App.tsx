import { useState } from 'react';
import { BacklogView } from './features/tasks/components/BacklogView';
import { SprintBoard } from './features/sprints/components/SprintBoard';

type Tab = 'backlog' | 'board';

export default function App() {
  const [tab, setTab] = useState<Tab>('backlog');

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] flex flex-col">
      <nav className="shrink-0 flex items-center gap-1 px-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        {(['backlog', 'board'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2.5 text-[13px] font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? 'border-[var(--color-accent)] text-[var(--color-fg)]'
                : 'border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
            }`}
          >
            {t === 'board' ? 'Sprint Board' : 'Backlog'}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-hidden">
        {tab === 'backlog' ? <BacklogView /> : <SprintBoard />}
      </div>
    </div>
  );
}

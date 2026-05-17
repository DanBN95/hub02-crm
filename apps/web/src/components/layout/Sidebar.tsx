import type { ReactNode } from 'react';

export type NavKey = 'tasks' | 'sprints' | 'documents';

interface NavItem {
  key: NavKey;
  label: string;
  icon: ReactNode;
}

const ITEMS: NavItem[] = [
  {
    key: 'tasks',
    label: 'Tasks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="2" y="6.75" width="12" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="2" y="10.5" width="12" height="2.5" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'sprints',
    label: 'Sprints',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5l2 4 4.5.5-3.25 3 .75 4.5L8 11.25 3.75 13.5l.75-4.5L1.25 6l4.5-.5L8 1.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 2h6L13 5.5V13a1 1 0 01-1 1H3.5a1 1 0 01-1-1V3a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M9 2v3.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
];

interface Props {
  active: NavKey;
  onSelect: (key: NavKey) => void;
}

export function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="w-[240px] shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
      <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-accent-fg)] flex items-center justify-center text-[13px] font-bold">
          h
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold text-[var(--color-fg)]">hub02</span>
          <span className="text-[11px] text-[var(--color-fg-muted)] mt-0.5">Workspace</span>
        </div>
      </div>

      <nav className="flex flex-col p-2 gap-0.5">
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-left transition-colors ${
                isActive
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)]'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <span className={isActive ? 'text-[var(--color-accent)]' : ''}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-3 border-t border-[var(--color-border)]">
        <p className="text-[11px] text-[var(--color-fg-subtle)] leading-snug">
          v0.3 · Sprint 2
        </p>
      </div>
    </aside>
  );
}

import type { ReactNode } from 'react';

export type NavKey = 'home' | 'tasks' | 'sprints' | 'teams' | 'documents' | 'settings';

interface NavItem {
  key: NavKey;
  label: string;
  icon: ReactNode;
  bottom?: boolean;
}

const ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"
        />
        <path d="M6 15v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
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
    key: 'teams',
    label: 'Teams',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M1 13c0-2.21 2.015-4 4.5-4s4.5 1.79 4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M10.5 9.2c1.5.3 3.5 1.3 3.5 3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
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
  {
    key: 'settings',
    label: 'Settings',
    bottom: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path
          d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        />
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

      <nav className="flex flex-col p-3 gap-1.5 flex-1">
        {ITEMS.filter((i) => !i.bottom).map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[15px] font-medium text-left transition-all ${
                isActive
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-fg)]'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[rgba(255,255,255,0.09)]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-accent)]" />
              )}
              <span className={`shrink-0 ${isActive ? 'text-[var(--color-accent)]' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--color-border)]">
        {ITEMS.filter((i) => i.bottom).map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[15px] font-medium text-left transition-all ${
                isActive
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-fg)]'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[rgba(255,255,255,0.09)]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-accent)]" />
              )}
              <span className={`shrink-0 ${isActive ? 'text-[var(--color-accent)]' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
        <p className="text-[11px] text-[var(--color-fg-subtle)] leading-snug px-2.5 pt-2">
          v0.4 · Sprint 3
        </p>
      </div>
    </aside>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMembers } from '../lib/members.queries';
import { useSprintsList } from '../features/sprints/sprints.queries';
import { useTasksList } from '../features/tasks/tasks.queries';
import type { NavKey } from './layout/Sidebar';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onOpenTask: (taskId: string) => void;
  onNavigate: (nav: NavKey) => void;
}

type ResultItem =
  | { kind: 'task';   id: string; title: string; status: string; sprintName?: string }
  | { kind: 'sprint'; id: string; title: string; isActive: boolean }
  | { kind: 'member'; id: string; title: string; email: string };

const MAX_PER_GROUP = 5;

function match(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase());
}

// ── status badge colors ───────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  BACKLOG:     'oklch(55% 0 0)',
  TODO:        'oklch(65% 0.14 250)',
  IN_PROGRESS: 'oklch(72% 0.16 75)',
  IN_REVIEW:   'oklch(65% 0.18 270)',
  DONE:        'oklch(65% 0.16 155)',
};

export function CommandPalette({ open, onClose, workspaceId, onOpenTask, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: tasksPage } = useTasksList(workspaceId, { limit: 200 });
  const { data: sprints = [] } = useSprintsList(workspaceId);
  const { data: members = [] } = useMembers(workspaceId);

  const tasks = tasksPage?.items ?? [];

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim();
    if (!q) return [];

    const taskHits: ResultItem[] = tasks
      .filter((t) => match(t.title, q))
      .slice(0, MAX_PER_GROUP)
      .map((t) => ({
        kind: 'task',
        id: t.id,
        title: t.title,
        status: t.status,
        sprintName: t.sprint?.name,
      }));

    const sprintHits: ResultItem[] = sprints
      .filter((s) => match(s.name, q))
      .slice(0, MAX_PER_GROUP)
      .map((s) => ({ kind: 'sprint', id: s.id, title: s.name, isActive: s.isActive ?? false }));

    const memberHits: ResultItem[] = members
      .filter((m) => match(m.name, q) || match(m.email, q))
      .slice(0, MAX_PER_GROUP)
      .map((m) => ({ kind: 'member', id: m.id, title: m.name, email: m.email }));

    return [...taskHits, ...sprintHits, ...memberHits];
  }, [query, tasks, sprints, members]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); activate(results[cursor]); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, cursor]);

  // Reset cursor when results change
  useEffect(() => { setCursor(0); }, [results]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  function activate(item: ResultItem | undefined) {
    if (!item) return;
    if (item.kind === 'task') {
      onNavigate('tasks');
      onOpenTask(item.id);
    } else if (item.kind === 'sprint') {
      onNavigate('sprints');
    }
    onClose();
  }

  if (!open) return null;

  // Build grouped display
  const taskResults = results.filter((r) => r.kind === 'task');
  const sprintResults = results.filter((r) => r.kind === 'sprint');
  const memberResults = results.filter((r) => r.kind === 'member');

  // flat index map
  const flatList = results;

  function renderItem(item: ResultItem, idx: number) {
    const isActive = idx === cursor;
    const base = [
      'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors duration-75 rounded-[var(--radius-sm)] mx-1',
      isActive ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]',
    ].join(' ');

    if (item.kind === 'task') {
      return (
        <div key={item.id} data-idx={idx} className={base} onClick={() => activate(item)}>
          <span
            className="shrink-0 w-2 h-2 rounded-full mt-px"
            style={{ background: STATUS_COLOR[item.status] ?? 'oklch(55% 0 0)' }}
          />
          <span className="flex-1 text-[13px] text-[var(--color-fg)] truncate">{item.title}</span>
          {item.sprintName && (
            <span className="text-[11px] text-[var(--color-fg-subtle)] shrink-0">{item.sprintName}</span>
          )}
        </div>
      );
    }

    if (item.kind === 'sprint') {
      return (
        <div key={item.id} data-idx={idx} className={base} onClick={() => activate(item)}>
          <span className="shrink-0 text-[var(--color-fg-muted)] text-[12px]">⚡</span>
          <span className="flex-1 text-[13px] text-[var(--color-fg)] truncate">{item.title}</span>
          {item.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[oklch(65%_0.16_155/0.15)] text-[oklch(65%_0.16_155)]">
              Active
            </span>
          )}
        </div>
      );
    }

    // member
    return (
      <div key={item.id} data-idx={idx} className={base} onClick={() => activate(item)}>
        <span className="shrink-0 text-[var(--color-fg-muted)] text-[12px]">👤</span>
        <span className="flex-1 text-[13px] text-[var(--color-fg)] truncate">{item.title}</span>
        <span className="text-[11px] text-[var(--color-fg-subtle)] shrink-0 truncate max-w-[140px]">
          {(item as Extract<ResultItem, { kind: 'member' }>).email}
        </span>
      </div>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      style={{ background: 'oklch(0% 0 0 / 0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[560px] mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[0_24px_64px_oklch(0%_0_0/0.55)] overflow-hidden"
        style={{ animation: 'palette-in 120ms ease-out' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <svg className="shrink-0 text-[var(--color-fg-muted)]" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, sprints, members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] outline-none"
          />
          <kbd className="text-[10px] text-[var(--color-fg-subtle)] border border-[var(--color-border)] rounded px-1 py-0.5">esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1.5">
          {query.trim() === '' && (
            <p className="text-[12px] text-[var(--color-fg-subtle)] text-center py-8">
              Type to search tasks, sprints, and members
            </p>
          )}

          {query.trim() !== '' && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[13px] text-[var(--color-fg-muted)]">No results for <em>"{query}"</em></p>
              <p className="text-[11px] text-[var(--color-fg-subtle)] mt-1">Try a different keyword or create a new task</p>
            </div>
          )}

          {taskResults.length > 0 && (
            <section>
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">Tasks</p>
              {taskResults.map((item) => renderItem(item, flatList.indexOf(item)))}
            </section>
          )}

          {sprintResults.length > 0 && (
            <section className={taskResults.length > 0 ? 'mt-1 pt-1 border-t border-[var(--color-border)]' : ''}>
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">Sprints</p>
              {sprintResults.map((item) => renderItem(item, flatList.indexOf(item)))}
            </section>
          )}

          {memberResults.length > 0 && (
            <section className={(taskResults.length > 0 || sprintResults.length > 0) ? 'mt-1 pt-1 border-t border-[var(--color-border)]' : ''}>
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">Members</p>
              {memberResults.map((item) => renderItem(item, flatList.indexOf(item)))}
            </section>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-3 text-[10px] text-[var(--color-fg-subtle)]">
            <span><kbd className="border border-[var(--color-border)] rounded px-1">↑↓</kbd> navigate</span>
            <span><kbd className="border border-[var(--color-border)] rounded px-1">↵</kbd> open</span>
            <span><kbd className="border border-[var(--color-border)] rounded px-1">esc</kbd> close</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes palette-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}

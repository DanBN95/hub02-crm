import { useMemo, useState } from 'react';
import type { Sprint } from '@hub02/shared';
import { Button } from '../../../components/ui/Button';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { useTasksList } from '../../tasks/tasks.queries';
import {
  useActivateSprint,
  useDeleteSprint,
  useSprintsList,
  useUpdateSprint,
} from '../sprints.queries';
import { CreateSprintModal } from './CreateSprintModal';


function toDateInputValue(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function isCompleted(sprint: Sprint, doneCount: number, totalCount: number): boolean {
  if (totalCount === 0) return false;
  if (doneCount !== totalCount) return false;
  if (sprint.endsAt && new Date(sprint.endsAt) > new Date()) return false;
  return true;
}

interface TimelineProps {
  startsAt: Date | string | null | undefined;
  endsAt: Date | string | null | undefined;
}

function Timeline({ startsAt, endsAt }: TimelineProps) {
  if (!startsAt || !endsAt) {
    return <span className="text-[11px] text-[var(--color-fg-subtle)]">—</span>;
  }
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const total = end - start;
  if (total <= 0) {
    return <span className="text-[11px] text-[var(--color-fg-subtle)]">—</span>;
  }
  const progress = Math.max(0, Math.min(1, (now - start) / total));
  const startedAlready = now >= start;
  const finished = now >= end;
  const color = finished
    ? 'var(--color-success)'
    : startedAlready
    ? 'var(--color-accent)'
    : 'var(--color-fg-subtle)';
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-32 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${progress * 100}%`, background: color }}
        />
      </div>
      <span className="text-[11px] text-[var(--color-fg-muted)] tabular-nums">
        {Math.round(progress * 100)}%
      </span>
    </div>
  );
}

interface RowProps {
  sprint: Sprint;
  taskCount: number;
  doneCount: number;
  workspaceId: string;
}

function SprintRow({ sprint, taskCount, doneCount, workspaceId }: RowProps) {
  const [editing, setEditing] = useState<null | 'name' | 'goal'>(null);
  const [draft, setDraft] = useState<{ name: string; goal: string }>({
    name: sprint.name,
    goal: sprint.goal ?? '',
  });

  const updateSprint = useUpdateSprint(workspaceId);
  const activateSprint = useActivateSprint(workspaceId);
  const deleteSprint = useDeleteSprint(workspaceId);

  const save = (field: 'name' | 'goal') => {
    const next = draft[field].trim();
    if (field === 'name' && !next) {
      setDraft({ ...draft, name: sprint.name });
    } else if (next !== (sprint[field] ?? '')) {
      updateSprint.mutate({ id: sprint.id, dto: { [field]: next || undefined } });
    }
    setEditing(null);
  };

  const onDateChange = (field: 'startsAt' | 'endsAt', value: string) => {
    if (!value) {
      updateSprint.mutate({ id: sprint.id, dto: { [field]: undefined } });
    } else {
      updateSprint.mutate({
        id: sprint.id,
        dto: { [field]: new Date(value).toISOString() },
      });
    }
  };

  const completed = isCompleted(sprint, doneCount, taskCount);

  return (
    <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors group">
      <td className="pl-4 pr-3 py-2.5 w-[200px]">
        {editing === 'name' ? (
          <input
            autoFocus
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onBlur={() => save('name')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save('name');
              if (e.key === 'Escape') {
                setDraft({ ...draft, name: sprint.name });
                setEditing(null);
              }
            }}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-accent)] rounded px-2 py-0.5 text-[13px] text-[var(--color-fg)] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('name')}
            className="text-[13px] font-medium text-[var(--color-fg)] hover:text-[var(--color-accent)] text-left truncate w-full"
          >
            {sprint.name}
          </button>
        )}
      </td>
      <td className="px-3 py-2.5 max-w-md">
        {editing === 'goal' ? (
          <input
            autoFocus
            value={draft.goal}
            onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
            onBlur={() => save('goal')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save('goal');
              if (e.key === 'Escape') {
                setDraft({ ...draft, goal: sprint.goal ?? '' });
                setEditing(null);
              }
            }}
            placeholder="Sprint goal"
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-accent)] rounded px-2 py-0.5 text-[13px] text-[var(--color-fg)] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('goal')}
            className="text-[13px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-left line-clamp-1 w-full"
          >
            {sprint.goal || <span className="text-[var(--color-fg-subtle)]">Add a goal…</span>}
          </button>
        )}
      </td>
      <td className="px-3 py-2.5 w-24 text-center">
        <button
          type="button"
          onClick={() => activateSprint.mutate(sprint.id)}
          className={`w-5 h-5 rounded-full border flex items-center justify-center mx-auto transition-colors ${
            sprint.isActive
              ? 'bg-[var(--color-success)] border-[var(--color-success)] text-[var(--color-success-fg)]'
              : 'border-[var(--color-border-strong)] text-transparent hover:border-[var(--color-success)]'
          }`}
          aria-label={sprint.isActive ? 'Active sprint' : 'Set as active'}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </td>
      <td className="px-3 py-2.5 w-44">
        <Timeline startsAt={sprint.startsAt} endsAt={sprint.endsAt} />
      </td>
      <td className="px-3 py-2.5 w-36">
        {taskCount === 0 ? (
          <span className="text-[11px] text-[var(--color-fg-subtle)]">—</span>
        ) : (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium tabular-nums" style={{ color: 'var(--color-accent)' }}>
                {doneCount} done
              </span>
              <span className="text-[10px] text-[var(--color-fg-subtle)] tabular-nums">
                / {taskCount}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((doneCount / taskCount) * 100)}%`,
                  background: doneCount === taskCount
                    ? 'var(--color-success)'
                    : 'var(--color-accent)',
                }}
              />
            </div>
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 w-28 text-center">
        {completed ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-success)] text-[var(--color-success-fg)]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <span className="text-[11px] text-[var(--color-fg-subtle)]">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 w-32">
        <input
          type="date"
          value={toDateInputValue(sprint.startsAt)}
          onChange={(e) => onDateChange('startsAt', e.target.value)}
          className="bg-transparent border-none outline-none text-[12px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] cursor-pointer w-full"
        />
      </td>
      <td className="px-3 py-2.5 w-32">
        <input
          type="date"
          value={toDateInputValue(sprint.endsAt)}
          onChange={(e) => onDateChange('endsAt', e.target.value)}
          className="bg-transparent border-none outline-none text-[12px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] cursor-pointer w-full"
        />
      </td>
      <td className="pr-4 py-2.5 w-12 text-right">
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete sprint "${sprint.name}"? Tasks will be moved to backlog.`)) {
              deleteSprint.mutate(sprint.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] p-1 rounded transition-all"
          aria-label="Delete sprint"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

export function SprintsTable({ workspaceId }: { workspaceId: string }) {
  const { role } = useWorkspace();
  const canEdit = role !== 'viewer';
  const [createOpen, setCreateOpen] = useState(false);

  const { data: sprints = [], isLoading } = useSprintsList(workspaceId);
  const { data: tasksPage } = useTasksList(workspaceId, { limit: 200 });
  const tasks = tasksPage?.items ?? [];

  const taskCountsBySprint = useMemo(() => {
    const counts = new Map<string, { total: number; done: number }>();
    for (const t of tasks) {
      if (!t.sprintId) continue;
      const entry = counts.get(t.sprintId) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (t.status === 'DONE') entry.done += 1;
      counts.set(t.sprintId, entry);
    }
    return counts;
  }, [tasks]);

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--color-fg)] tracking-tight">Sprints</h1>
          <p className="text-[12px] text-[var(--color-fg-muted)] mt-0.5">
            {sprints.length} {sprints.length === 1 ? 'sprint' : 'sprints'} ·{' '}
            {sprints.filter((s) => s.isActive).length} active
          </p>
        </div>
        {canEdit && (
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            + Create sprint
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface)]">
            <table className="w-full border-collapse">
              <thead className="bg-[var(--color-surface-2)]/40">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="pl-4 pr-3 py-2.5 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-[200px]">Sprint</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide">Sprint goals</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-24">Active</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-44">Timeline</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-32">Tasks</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-28">Completed?</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-32">Start date</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-32">End date</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-[var(--color-border)]">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="h-3 rounded bg-[var(--color-surface-2)] animate-pulse" style={{ width: `${50 + (j * 5)}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : sprints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <p className="text-[13px] text-[var(--color-fg-muted)] mb-3">No sprints yet</p>
                      <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                        Create your first sprint
                      </Button>
                    </td>
                  </tr>
                ) : (
                  sprints.map((sprint) => {
                    const counts = taskCountsBySprint.get(sprint.id) ?? { total: 0, done: 0 };
                    return (
                      <SprintRow
                        key={sprint.id}
                        sprint={sprint as Sprint}
                        taskCount={counts.total}
                        doneCount={counts.done}
                        workspaceId={workspaceId}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {sprints.length > 0 && (
            <p className="text-[11px] text-[var(--color-fg-subtle)] mt-3 px-1">
              Click any cell to edit. Click the active circle to switch sprints.
            </p>
          )}
        </div>
      </div>

      <CreateSprintModal
        workspaceId={workspaceId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

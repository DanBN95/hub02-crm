import type { TaskWithRelations } from '../../tasks/tasks.api';

const PRIORITY_COLOR: Record<string, string> = {
  P0: 'var(--color-priority-p0)',
  P1: 'var(--color-priority-p1)',
  P2: 'var(--color-priority-p2)',
  P3: 'var(--color-priority-p3)',
};

function formatDue(d: Date | string | null | undefined) {
  if (!d) return null;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(d));
}

function isOverdue(d: Date | string | null | undefined) {
  if (!d) return false;
  return new Date(d) < new Date();
}

interface Props {
  task: TaskWithRelations;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: Props) {
  const dueLabel = formatDue(task.dueAt);
  const overdue = isOverdue(task.dueAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2.5 hover:border-[var(--color-border-strong,var(--color-accent))] hover:bg-[var(--color-surface)] transition-colors group"
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-1 w-2 h-2 rounded-full shrink-0"
          style={{ background: PRIORITY_COLOR[task.priority] ?? 'var(--color-fg-muted)' }}
          aria-label={`Priority ${task.priority}`}
        />
        <span className="flex-1 text-[13px] text-[var(--color-fg)] leading-snug line-clamp-2">
          {task.title}
        </span>
      </div>

      {(task.assignee || dueLabel) && (
        <div className="flex items-center justify-between mt-2 gap-2">
          {task.assignee ? (
            <span
              className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] flex items-center justify-center text-[10px] font-semibold shrink-0"
              title={task.assignee.name}
              aria-label={task.assignee.name}
            >
              {task.assignee.name[0]?.toUpperCase()}
            </span>
          ) : (
            <span />
          )}
          {dueLabel && (
            <span
              className={`text-[11px] font-medium ${overdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-fg-muted)]'}`}
            >
              {dueLabel}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

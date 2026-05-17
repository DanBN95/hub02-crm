import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/Popover';
import { useUpdateTask } from '../../tasks.queries';

function toDateInput(v: string | null | undefined): string {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatDate(v: string): string {
  const d = new Date(v);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dateColor(v: string | null | undefined): string {
  if (!v) return 'var(--color-fg-subtle)';
  const d = new Date(v);
  const now = new Date();
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'var(--color-danger)';
  if (diffDays <= 3) return 'oklch(72% 0.16 75)';
  return 'var(--color-fg-muted)';
}

interface Props {
  taskId: string;
  dueAt: string | null | undefined;
  workspaceId: string;
  readonly?: boolean;
}

export function DueDateCell({ taskId, dueAt, workspaceId, readonly }: Props) {
  const update = useUpdateTask(workspaceId);

  const label = dueAt ? formatDate(dueAt) : '—';
  const color = dateColor(dueAt);

  if (readonly) {
    return (
      <span className="text-[12px] tabular-nums" style={{ color }}>
        {label}
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        className="text-[12px] tabular-nums px-1.5 py-0.5 rounded-[var(--radius-md)]
                   hover:bg-[var(--color-surface-2)] transition-colors outline-none
                   focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        style={{ color }}
      >
        {label}
      </PopoverTrigger>
      <PopoverContent className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[0_8px_24px_oklch(0%_0_0/0.4)] p-2 flex flex-col gap-1">
        <input
          type="date"
          defaultValue={toDateInput(dueAt)}
          onChange={(e) => {
            const val = e.target.value;
            update.mutate({
              id: taskId,
              dto: { dueAt: val ? new Date(val).toISOString() : undefined },
            });
          }}
          className="bg-[var(--color-surface-2)] text-[12px] text-[var(--color-fg)]
                     px-2 py-1.5 rounded-[var(--radius-md)] outline-none
                     focus:ring-1 focus:ring-[var(--color-accent)] w-[150px]"
        />
        {dueAt && (
          <button
            type="button"
            onClick={() => update.mutate({ id: taskId, dto: { dueAt: undefined } })}
            className="text-[11px] text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)]
                       text-left transition-colors px-1"
          >
            Clear date
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

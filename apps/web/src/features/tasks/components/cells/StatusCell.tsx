import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/Popover';
import { useUpdateTask } from '../../tasks.queries';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

const STATUSES: { value: TaskStatus; label: string; color: string; bg: string }[] = [
  { value: 'BACKLOG',     label: 'Backlog',     color: 'oklch(55% 0 0)',         bg: 'oklch(55% 0 0 / 0.12)' },
  { value: 'TODO',        label: 'To Do',       color: 'oklch(65% 0.14 250)',    bg: 'oklch(65% 0.14 250 / 0.12)' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'oklch(72% 0.16 75)',     bg: 'oklch(72% 0.16 75 / 0.12)' },
  { value: 'IN_REVIEW',   label: 'In Review',   color: 'oklch(65% 0.18 270)',    bg: 'oklch(65% 0.18 270 / 0.12)' },
  { value: 'DONE',        label: 'Done',        color: 'oklch(65% 0.16 155)',    bg: 'oklch(65% 0.16 155 / 0.12)' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s])) as Record<TaskStatus, (typeof STATUSES)[0]>;

interface Props {
  taskId: string;
  status: TaskStatus;
  workspaceId: string;
  readonly?: boolean;
}

export function StatusCell({ taskId, status, workspaceId, readonly }: Props) {
  const update = useUpdateTask(workspaceId);
  const current = STATUS_MAP[status] ?? STATUSES[0]!;

  if (readonly) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
        style={{ background: current.bg, color: current.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: current.color }} />
        {current.label}
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium
                   hover:brightness-110 transition-all duration-100
                   focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
        style={{ background: current.bg, color: current.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: current.color }} />
        {current.label}
        <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-50 ml-0.5 shrink-0">
          <path d="M1.5 3L4 5.5 6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      </PopoverTrigger>
      <PopoverContent className="w-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[0_8px_24px_oklch(0%_0_0/0.4)] overflow-hidden py-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => update.mutate({ id: taskId, dto: { status: s.value } })}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-[var(--color-fg-muted)]
                       hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]
                       transition-colors duration-100 outline-none text-left"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            {s.label}
            {s.value === status && (
              <svg width="12" height="12" viewBox="0 0 12 12" className="ml-auto text-[var(--color-accent)]">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

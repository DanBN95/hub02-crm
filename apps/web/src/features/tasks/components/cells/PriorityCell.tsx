import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/Popover';
import { useUpdateTask } from '../../tasks.queries';

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

const PRIORITIES: { value: TaskPriority; label: string; color: string; icon: string }[] = [
  { value: 'P0', label: 'Critical', color: 'oklch(62% 0.22 25)',  icon: '◆' },
  { value: 'P1', label: 'High',     color: 'oklch(68% 0.18 50)',  icon: '▲' },
  { value: 'P2', label: 'Medium',   color: 'oklch(72% 0.16 90)',  icon: '●' },
  { value: 'P3', label: 'Low',      color: 'oklch(55% 0 0)',      icon: '—' },
];

export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.value, p])) as Record<TaskPriority, (typeof PRIORITIES)[0]>;

interface Props {
  taskId: string;
  priority: TaskPriority;
  workspaceId: string;
  readonly?: boolean;
}

export function PriorityCell({ taskId, priority, workspaceId, readonly }: Props) {
  const update = useUpdateTask(workspaceId);
  const current = PRIORITY_MAP[priority] ?? PRIORITIES[2]!;

  const trigger = (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: current.color }}>
      <span className="text-[10px] leading-none">{current.icon}</span>
      {current.label}
    </span>
  );

  if (readonly) return trigger;

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[var(--radius-md)]
                   hover:bg-[var(--color-surface-2)] transition-colors duration-100
                   focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] outline-none"
      >
        {trigger}
        <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-40 shrink-0">
          <path d="M1.5 3L4 5.5 6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      </PopoverTrigger>
      <PopoverContent className="w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[0_8px_24px_oklch(0%_0_0/0.4)] overflow-hidden py-1">
        {PRIORITIES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => update.mutate({ id: taskId, dto: { priority: p.value } })}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-[var(--color-fg-muted)]
                       hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]
                       transition-colors duration-100 outline-none text-left"
          >
            <span className="text-[10px] leading-none shrink-0" style={{ color: p.color }}>{p.icon}</span>
            {p.label}
            {p.value === priority && (
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

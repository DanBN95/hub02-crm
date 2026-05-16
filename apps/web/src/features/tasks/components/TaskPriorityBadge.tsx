const PRIORITY_CONFIG = {
  P0: { label: 'Critical', color: 'var(--color-priority-p0)' },
  P1: { label: 'High', color: 'var(--color-priority-p1)' },
  P2: { label: 'Medium', color: 'var(--color-priority-p2)' },
  P3: { label: 'Low', color: 'var(--color-priority-p3)' },
} as const;

type Priority = keyof typeof PRIORITY_CONFIG;

interface Props {
  priority: Priority;
  onClick?: () => void;
}

export function TaskPriorityBadge({ priority, onClick }: Props) {
  const { label, color } = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.P2;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-opacity hover:opacity-80"
      style={{ background: `${color}22`, color }}
      aria-label={`Priority: ${label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {priority}
    </button>
  );
}

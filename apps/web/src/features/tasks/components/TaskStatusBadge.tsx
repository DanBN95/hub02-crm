const STATUS_CONFIG = {
  BACKLOG: { label: 'Backlog', bg: 'var(--color-surface-2)', fg: 'var(--color-fg-muted)' },
  TODO: { label: 'Todo', bg: 'oklch(70% 0.12 230 / 0.15)', fg: 'var(--color-info)' },
  IN_PROGRESS: { label: 'In Progress', bg: 'oklch(65% 0.18 270 / 0.15)', fg: 'var(--color-accent)' },
  IN_REVIEW: { label: 'In Review', bg: 'oklch(78% 0.15 75 / 0.15)', fg: 'var(--color-warning)' },
  DONE: { label: 'Done', bg: 'oklch(70% 0.16 150 / 0.15)', fg: 'var(--color-success)' },
} as const;

type Status = keyof typeof STATUS_CONFIG;

interface Props {
  status: Status;
  onClick?: () => void;
}

export function TaskStatusBadge({ status, onClick }: Props) {
  const { label, bg, fg } = STATUS_CONFIG[status] ?? STATUS_CONFIG.BACKLOG;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-opacity hover:opacity-80"
      style={{ background: bg, color: fg }}
      aria-label={`Status: ${label}`}
    >
      {label}
    </button>
  );
}

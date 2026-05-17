import { useState } from 'react';
import { Avatar } from '../../../../components/ui/Avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/Popover';
import { useUpdateTask } from '../../tasks.queries';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Props {
  taskId: string;
  assignee: Member | null;
  members: Member[];
  workspaceId: string;
  readonly?: boolean;
}

export function OwnerCell({ taskId, assignee, members, workspaceId, readonly }: Props) {
  const update = useUpdateTask(workspaceId);
  const [search, setSearch] = useState('');

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  const trigger = assignee ? (
    <span className="inline-flex items-center gap-1.5">
      <Avatar name={assignee.name} avatarUrl={assignee.avatarUrl} size={18} />
      <span className="text-[12px] text-[var(--color-fg-muted)] truncate max-w-[90px]">{assignee.name}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-[18px] h-[18px] rounded-full border border-dashed border-[var(--color-border-strong)]
                   flex items-center justify-center text-[var(--color-fg-subtle)] shrink-0"
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.5 9c0-1.93 1.57-3.5 3.5-3.5S8.5 7.07 8.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[12px] text-[var(--color-fg-subtle)]">Unassigned</span>
    </span>
  );

  if (readonly) return trigger;

  return (
    <Popover onOpenChange={(v) => { if (!v) setSearch(''); }}>
      <PopoverTrigger
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-md)]
                   hover:bg-[var(--color-surface-2)] transition-colors duration-100
                   focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] outline-none"
      >
        {trigger}
        <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-40 shrink-0 ml-0.5">
          <path d="M1.5 3L4 5.5 6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      </PopoverTrigger>
      <PopoverContent className="w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[0_8px_24px_oklch(0%_0_0/0.4)] overflow-hidden">
        <div className="px-2 pt-2 pb-1.5 border-b border-[var(--color-border)]">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find member…"
            className="w-full bg-[var(--color-surface-2)] text-[12px] text-[var(--color-fg)]
                       placeholder:text-[var(--color-fg-subtle)]
                       px-2 py-1.5 rounded-[var(--radius-md)] outline-none
                       focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="py-1 max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => update.mutate({ id: taskId, dto: { assigneeId: undefined } })}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px]
                       text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]
                       transition-colors outline-none text-left"
          >
            <span className="w-5 h-5 rounded-full border border-dashed border-[var(--color-border-strong)] shrink-0" />
            No owner
            {!assignee && (
              <svg width="12" height="12" viewBox="0 0 12 12" className="ml-auto text-[var(--color-accent)]">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </button>
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => update.mutate({ id: taskId, dto: { assigneeId: m.id } })}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px]
                         text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]
                         transition-colors outline-none text-left"
            >
              <Avatar name={m.name} avatarUrl={m.avatarUrl} size={20} />
              <span className="truncate">{m.name}</span>
              {assignee?.id === m.id && (
                <svg width="12" height="12" viewBox="0 0 12 12" className="ml-auto shrink-0 text-[var(--color-accent)]">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-[11px] text-[var(--color-fg-subtle)] px-3 py-2">No members found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

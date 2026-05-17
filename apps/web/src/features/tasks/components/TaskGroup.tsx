import { useState } from 'react';
import type { TaskWithRelations } from '../tasks.api';
import { useDeleteTask, useUpdateTask } from '../tasks.queries';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskStatusBadge } from './TaskStatusBadge';

const STATUS_OPTIONS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;

function formatDate(d: Date | string | null | undefined) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(d));
}

interface TaskRowProps {
  task: TaskWithRelations;
  workspaceId: string;
}

function TaskRow({ task, workspaceId }: TaskRowProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [hovered, setHovered] = useState(false);

  const updateTask = useUpdateTask(workspaceId);
  const deleteTask = useDeleteTask(workspaceId);

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== task.title) {
      updateTask.mutate({ id: task.id, dto: { title: titleDraft.trim() } });
    } else {
      setTitleDraft(task.title);
    }
    setEditingTitle(false);
  };

  return (
    <tr
      className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="pl-3 pr-2 py-2.5 max-w-xs">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') {
                setTitleDraft(task.title);
                setEditingTitle(false);
              }
            }}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-accent)] rounded px-2 py-0.5 text-[13px] text-[var(--color-fg)] outline-none"
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={() => setEditingTitle(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(true); }}
            className="text-[13px] text-[var(--color-fg)] truncate block cursor-text hover:text-[var(--color-accent)]"
          >
            {task.title}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 w-32">
        <TaskStatusBadge
          status={task.status as Parameters<typeof TaskStatusBadge>[0]['status']}
          onClick={() => {
            const cur = STATUS_OPTIONS.indexOf(task.status as typeof STATUS_OPTIONS[number]);
            const next = STATUS_OPTIONS[(cur + 1) % STATUS_OPTIONS.length];
            if (next) updateTask.mutate({ id: task.id, dto: { status: next } });
          }}
        />
      </td>
      <td className="px-3 py-2.5 w-20">
        <TaskPriorityBadge
          priority={task.priority as Parameters<typeof TaskPriorityBadge>[0]['priority']}
        />
      </td>
      <td className="px-3 py-2.5 text-[12px] text-[var(--color-fg-muted)] w-40">
        {task.assignee ? (
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] flex items-center justify-center text-[10px] font-semibold shrink-0">
              {task.assignee.name[0]?.toUpperCase()}
            </span>
            <span className="truncate">{task.assignee.name}</span>
          </span>
        ) : (
          <span className="text-[var(--color-fg-subtle)]">Unassigned</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-[12px] text-[var(--color-fg-muted)] w-24 tabular-nums">
        {formatDate(task.dueAt)}
      </td>
      <td className="pr-3 py-2.5 w-10 text-right">
        {hovered && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this task?')) deleteTask.mutate(task.id);
            }}
            className="text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] p-1 rounded transition-colors"
            aria-label="Delete task"
          >
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}

interface Props {
  title: string;
  subtitle?: string;
  tasks: TaskWithRelations[];
  color: string;
  workspaceId: string;
  onAddTask: () => void;
  defaultOpen?: boolean;
}

export function TaskGroup({
  title,
  subtitle,
  tasks,
  color,
  workspaceId,
  onAddTask,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none border-l-[3px]"
        style={{ borderLeftColor: color }}
        onClick={() => setOpen((o) => !o)}
      >
        <button
          type="button"
          aria-label={open ? 'Collapse group' : 'Expand group'}
          className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h3 className="text-[14px] font-semibold" style={{ color }}>
          {title}
        </h3>
        {subtitle && (
          <span className="text-[11px] text-[var(--color-fg-muted)]">{subtitle}</span>
        )}
        <span className="ml-auto text-[11px] text-[var(--color-fg-subtle)] tabular-nums">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {open && (
        <div className="border-t border-[var(--color-border)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/40">
                <th className="pl-3 pr-2 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide">Task</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-32">Status</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-20">Priority</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-40">Owner</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-24">Due</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-[12px] text-[var(--color-fg-subtle)]">
                    No tasks yet
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <TaskRow key={task.id} task={task} workspaceId={workspaceId} />
                ))
              )}
            </tbody>
          </table>

          <button
            type="button"
            onClick={onAddTask}
            className="w-full text-left pl-9 pr-3 py-2 text-[12px] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors border-t border-[var(--color-border)]"
          >
            + Add task
          </button>
        </div>
      )}
    </div>
  );
}

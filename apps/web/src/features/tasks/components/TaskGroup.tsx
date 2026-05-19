import { useState } from 'react';
import type { Member } from '../../../lib/members';
import type { TaskWithRelations } from '../tasks.api';
import { useDeleteTask } from '../tasks.queries';
import { DueDateCell } from './cells/DueDateCell';
import { OwnerCell } from './cells/OwnerCell';
import { PriorityCell } from './cells/PriorityCell';
import { StatusCell } from './cells/StatusCell';

interface TaskRowProps {
  task: TaskWithRelations;
  workspaceId: string;
  members: Member[];
  onOpenDetail: (taskId: string) => void;
}

function TaskRow({ task, workspaceId, members, onOpenDetail }: TaskRowProps) {
  const deleteTask = useDeleteTask(workspaceId);

  return (
    <tr
      className="group border-b border-[rgba(255,255,255,0.04)] last:border-0 transition-colors duration-100"
      style={{ ['--row-hover-bg' as string]: 'rgba(255,255,255,0.04)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      {/* Title */}
      <td className="pl-4 pr-2 py-3 max-w-xs">
        <button
          type="button"
          onClick={() => onOpenDetail(task.id)}
          className="text-[13px] text-[var(--color-fg)] truncate block w-full text-left
                     hover:text-[var(--color-accent)] transition-colors duration-100"
        >
          {task.title}
        </button>
      </td>

      {/* Status */}
      <td className="px-3 py-3 w-36">
        <StatusCell taskId={task.id} status={task.status as any} workspaceId={workspaceId} />
      </td>

      {/* Priority */}
      <td className="px-3 py-3 w-28">
        <PriorityCell taskId={task.id} priority={task.priority as any} workspaceId={workspaceId} />
      </td>

      {/* Owner */}
      <td className="px-3 py-3 w-44">
        <OwnerCell taskId={task.id} assignee={task.assignee} members={members} workspaceId={workspaceId} />
      </td>

      {/* Due */}
      <td className="px-3 py-3 w-28">
        <DueDateCell taskId={task.id} dueAt={task.dueAt} workspaceId={workspaceId} />
      </td>

      {/* Delete */}
      <td className="pr-4 py-3 w-10 text-right">
        <button
          type="button"
          onClick={() => { if (confirm('Delete this task?')) deleteTask.mutate(task.id); }}
          className="opacity-0 group-hover:opacity-100 text-[var(--color-fg-subtle)]
                     hover:text-[var(--color-danger)] p-1 rounded
                     transition-opacity duration-100"
          aria-label="Delete task"
        >
          ✕
        </button>
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
  members: Member[];
  onAddTask: () => void;
  onOpenDetail: (taskId: string) => void;
  defaultOpen?: boolean;
}

export function TaskGroup({
  title,
  subtitle,
  tasks,
  color,
  workspaceId,
  members,
  onAddTask,
  onOpenDetail,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-[var(--radius-lg)]`}
      style={{
        background: 'color-mix(in oklch, var(--color-surface) 82%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px oklch(0% 0 0 / 0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Group header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ background: `${color}0d` }}
        onClick={() => setOpen((o) => !o)}
      >
        <button
          type="button"
          aria-label={open ? 'Collapse' : 'Expand'}
          className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] shrink-0"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h3 className="text-[13px] font-semibold tracking-tight" style={{ color }}>
          {title}
        </h3>
        {subtitle && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: `${color}20`, color }}
          >
            {subtitle}
          </span>
        )}
        <span className="ml-auto text-[11px] text-[var(--color-fg-subtle)] tabular-nums">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th className="pl-4 pr-2 py-2.5 text-left text-[10px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider">Task</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider w-36">Status</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider w-28">Priority</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider w-44">Owner</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider w-28">Due</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-[var(--color-fg-subtle)]">
                    No tasks yet
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    workspaceId={workspaceId}
                    members={members}
                    onOpenDetail={onOpenDetail}
                  />
                ))
              )}
            </tbody>
          </table>

          <button
            type="button"
            onClick={onAddTask}
            className="w-full text-left pl-10 pr-4 py-2.5 text-[12px] text-[var(--color-fg-subtle)]
                       hover:text-[var(--color-fg)] transition-colors duration-100"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            + Add task
          </button>
        </div>
      )}
    </div>
  );
}

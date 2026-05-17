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
    <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors group">
      {/* Title — click opens detail panel */}
      <td className="pl-3 pr-2 py-2.5 max-w-xs">
        <button
          type="button"
          onClick={() => onOpenDetail(task.id)}
          className="text-[13px] text-[var(--color-fg)] truncate block w-full text-left
                     hover:text-[var(--color-accent)] transition-colors"
        >
          {task.title}
        </button>
      </td>

      {/* Status */}
      <td className="px-3 py-2.5 w-36">
        <StatusCell taskId={task.id} status={task.status as any} workspaceId={workspaceId} />
      </td>

      {/* Priority */}
      <td className="px-3 py-2.5 w-28">
        <PriorityCell taskId={task.id} priority={task.priority as any} workspaceId={workspaceId} />
      </td>

      {/* Owner */}
      <td className="px-3 py-2.5 w-44">
        <OwnerCell
          taskId={task.id}
          assignee={task.assignee}
          members={members}
          workspaceId={workspaceId}
        />
      </td>

      {/* Due */}
      <td className="px-3 py-2.5 w-28">
        <DueDateCell taskId={task.id} dueAt={task.dueAt} workspaceId={workspaceId} />
      </td>

      {/* Delete */}
      <td className="pr-3 py-2.5 w-10 text-right">
        <button
          type="button"
          onClick={() => {
            if (confirm('Delete this task?')) deleteTask.mutate(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-[var(--color-fg-subtle)]
                     hover:text-[var(--color-danger)] p-1 rounded transition-all"
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
    <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Group header — colored left stripe replaced with tinted bg strip */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none"
        style={{ background: `${color}12` }}
        onClick={() => setOpen((o) => !o)}
      >
        <button
          type="button"
          aria-label={open ? 'Collapse' : 'Expand'}
          className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-transform shrink-0"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h3 className="text-[13px] font-semibold" style={{ color }}>
          {title}
        </h3>
        {subtitle && (
          <span className="text-[11px]" style={{ color: `${color}bb` }}>{subtitle}</span>
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
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-36">Status</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-28">Priority</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-44">Owner</th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide w-28">Due</th>
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
            className="w-full text-left pl-9 pr-3 py-2 text-[12px] text-[var(--color-fg-subtle)]
                       hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]
                       transition-colors border-t border-[var(--color-border)]"
          >
            + Add task
          </button>
        </div>
      )}
    </div>
  );
}

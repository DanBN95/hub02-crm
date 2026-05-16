import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { CreateTaskSlideover } from '../../tasks/components/CreateTaskSlideover';
import { useUpdateTask } from '../../tasks/tasks.queries';
import { useBoardColumns } from '../../tasks/tasks.queries';
import type { TaskWithRelations } from '../../tasks/tasks.api';
import { useSprintsList, useActivateSprint } from '../sprints.queries';
import { CreateSprintModal } from './CreateSprintModal';
import { TaskCard } from './TaskCard';

const DEMO_WORKSPACE = import.meta.env['VITE_WORKSPACE_ID'] ?? 'demo';

const COLUMNS = [
  { key: 'BACKLOG', label: 'Backlog' },
  { key: 'TODO', label: 'Todo' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' },
] as const;

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'var(--color-fg-muted)',
  TODO: 'var(--color-info)',
  IN_PROGRESS: 'var(--color-accent)',
  IN_REVIEW: 'var(--color-warning)',
  DONE: 'var(--color-success)',
};

function formatDate(d: Date | string | null | undefined) {
  if (!d) return null;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(d));
}

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] animate-pulse" />
      ))}
    </div>
  );
}

interface KanbanColumnProps {
  columnKey: string;
  label: string;
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onAddTask: (status: string) => void;
  workspaceId: string;
}

function KanbanColumn({ columnKey, label, tasks, isLoading, onAddTask, workspaceId }: KanbanColumnProps) {
  const updateTask = useUpdateTask(workspaceId);
  const color = STATUS_COLORS[columnKey] ?? 'var(--color-fg-muted)';

  return (
    <div className="flex flex-col min-w-[220px] w-[220px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-[12px] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide">
          {label}
        </span>
        <span className="ml-auto text-[11px] text-[var(--color-fg-subtle)] tabular-nums">
          {isLoading ? '—' : tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-[120px]">
        {isLoading ? (
          <ColumnSkeleton />
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[12px] text-[var(--color-fg-subtle)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] py-8">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => {
                const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
                const cur = statuses.indexOf(task.status);
                const next = statuses[(cur + 1) % statuses.length];
                if (next) updateTask.mutate({ id: task.id, dto: { status: next as 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' } });
              }}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => onAddTask(columnKey)}
        className="mt-2 w-full text-left px-2 py-1.5 text-[12px] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] transition-colors"
      >
        + Add task
      </button>
    </div>
  );
}

export function SprintBoard() {
  const workspaceId = DEMO_WORKSPACE;
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [slideoverStatus, setSlideoverStatus] = useState<string | null>(null);

  const { data: sprints = [] } = useSprintsList(workspaceId);
  const activeSprint = sprints.find((s) => s.isActive) ?? sprints[0] ?? null;
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const sprintId = selectedSprintId ?? activeSprint?.id ?? null;

  const activateSprint = useActivateSprint(workspaceId);
  const { data: columns, isLoading } = useBoardColumns(workspaceId, sprintId);

  const sprint = sprints.find((s) => s.id === sprintId) ?? null;
  const allTasks = columns ? Object.values(columns).flat() : [];
  const doneTasks = columns?.['DONE']?.length ?? 0;
  const progress = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)] shrink-0 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <select
              value={sprintId ?? ''}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedSprintId(id || null);
                if (id) void activateSprint.mutateAsync(id);
              }}
              className="text-[14px] font-semibold text-[var(--color-fg)] bg-transparent border-none outline-none cursor-pointer"
              aria-label="Select sprint"
            >
              {sprints.length === 0 && <option value="">No sprints</option>}
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.isActive ? ' (active)' : ''}
                </option>
              ))}
            </select>
            {sprint?.startsAt && sprint?.endsAt && (
              <span className="text-[12px] text-[var(--color-fg-muted)] shrink-0">
                {formatDate(sprint.startsAt)} – {formatDate(sprint.endsAt)}
              </span>
            )}
          </div>
          {allTasks.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="h-1 flex-1 max-w-[160px] bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-success)] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] text-[var(--color-fg-muted)]">
                {doneTasks}/{allTasks.length} done
              </span>
            </div>
          )}
        </div>

        <Button variant="primary" size="sm" onClick={() => setCreateSprintOpen(true)}>
          + New sprint
        </Button>
      </div>

      {/* Board */}
      {!sprintId ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <p className="text-[13px] text-[var(--color-fg-muted)]">No active sprint</p>
          <Button variant="primary" size="sm" onClick={() => setCreateSprintOpen(true)}>
            Create your first sprint
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="flex gap-4 h-full">
            {COLUMNS.map(({ key, label }) => (
              <KanbanColumn
                key={key}
                columnKey={key}
                label={label}
                tasks={columns?.[key] ?? []}
                isLoading={isLoading}
                onAddTask={(status) => setSlideoverStatus(status)}
                workspaceId={workspaceId}
              />
            ))}
          </div>
        </div>
      )}

      <CreateSprintModal
        workspaceId={workspaceId}
        open={createSprintOpen}
        onClose={() => setCreateSprintOpen(false)}
      />

      <CreateTaskSlideover
        workspaceId={workspaceId}
        open={slideoverStatus !== null}
        onClose={() => setSlideoverStatus(null)}
      />
    </div>
  );
}

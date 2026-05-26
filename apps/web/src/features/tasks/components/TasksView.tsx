import { useMemo, useState } from 'react';
import { useMembers } from '../../../lib/members.queries';
import { useTeamsList } from '../../teams/teams.queries';
import { useSprintsList } from '../../sprints/sprints.queries';
import { useTasksList } from '../tasks.queries';
import { useTaskFilters } from '../useTaskFilters';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { CreateTaskSlideover } from './CreateTaskSlideover';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskFilterBar } from './TaskFilterBar';
import { TaskGroup } from './TaskGroup';

const SPRINT_COLORS = [
  'oklch(70% 0.18 25)',
  'oklch(70% 0.18 270)',
  'oklch(72% 0.16 150)',
  'oklch(75% 0.15 75)',
  'oklch(70% 0.15 320)',
  'oklch(70% 0.14 220)',
];

interface Props {
  workspaceId: string;
  externalDetailTaskId?: string | null;
  onExternalDetailClose?: () => void;
}

export function TasksView({ workspaceId, externalDetailTaskId, onExternalDetailClose }: Props) {
  const { role } = useWorkspace();
  const canEdit = role !== 'viewer';
  const [filters, setFilters, clearFilters] = useTaskFilters();
  const { data: sprints = [], isLoading: sprintsLoading } = useSprintsList(workspaceId);
  const { data: tasksPage, isLoading: tasksLoading } = useTasksList(workspaceId, { limit: 200, ...filters });
  const { data: members = [] } = useMembers(workspaceId);
  const { data: teams = [] } = useTeamsList(workspaceId);
  const tasks = tasksPage?.items ?? [];

  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [internalDetailTaskId, setInternalDetailTaskId] = useState<string | null>(null);

  const detailTaskId = externalDetailTaskId ?? internalDetailTaskId;
  function closeDetail() {
    setInternalDetailTaskId(null);
    onExternalDetailClose?.();
  }

  const groups = useMemo(() => {
    const bySprintId = new Map<string, typeof tasks>();
    const backlog: typeof tasks = [];
    for (const task of tasks) {
      if (task.sprintId) {
        const list = bySprintId.get(task.sprintId) ?? [];
        list.push(task);
        bySprintId.set(task.sprintId, list);
      } else {
        backlog.push(task);
      }
    }
    return { bySprintId, backlog };
  }, [tasks]);

  const isLoading = sprintsLoading || tasksLoading;

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[20px] font-semibold text-[var(--color-fg)] tracking-tight">Tasks</h1>
            <p className="text-[12px] text-[var(--color-fg-muted)] mt-0.5">
              {tasks.length} tasks across {sprints.length} {sprints.length === 1 ? 'sprint' : 'sprints'}
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setSlideoverOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[13px] font-medium
                         bg-[var(--color-accent)] text-white hover:opacity-90 active:scale-[0.97]
                         transition-all duration-100"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              New task
            </button>
          )}
        </div>
        <TaskFilterBar
          filters={filters}
          members={members}
          teams={teams}
          onFilter={setFilters}
          onClear={clearFilters}
        />
      </header>

      <div className="flex-1 overflow-auto px-6 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-[var(--radius-md)] bg-[var(--color-surface)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-[1200px]">
            {sprints.map((sprint, idx) => (
              <TaskGroup
                key={sprint.id}
                title={sprint.name}
                subtitle={sprint.isActive ? 'Active' : undefined}
                color={SPRINT_COLORS[idx % SPRINT_COLORS.length] ?? 'oklch(70% 0.18 270)'}
                tasks={groups.bySprintId.get(sprint.id) ?? []}
                workspaceId={workspaceId}
                members={members}
                onOpenDetail={setInternalDetailTaskId}
                defaultOpen={sprint.isActive}
              />
            ))}

            <TaskGroup
              title="Backlog"
              color="oklch(60% 0 0)"
              tasks={groups.backlog}
              workspaceId={workspaceId}
              members={members}
              onOpenDetail={setInternalDetailTaskId}
              defaultOpen
            />
          </div>
        )}
      </div>

      <CreateTaskSlideover
        workspaceId={workspaceId}
        open={slideoverOpen}
        onClose={() => setSlideoverOpen(false)}
        sprints={sprints}
      />

      <TaskDetailPanel
        taskId={detailTaskId}
        workspaceId={workspaceId}
        onClose={closeDetail}
      />
    </div>
  );
}

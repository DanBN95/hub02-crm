import { useMemo, useState } from 'react';
import { useMembers } from '../../../lib/members.queries';
import { useSprintsList } from '../../sprints/sprints.queries';
import { useTasksList } from '../tasks.queries';
import { CreateTaskSlideover } from './CreateTaskSlideover';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskGroup } from './TaskGroup';

const SPRINT_COLORS = [
  'oklch(70% 0.18 25)',
  'oklch(70% 0.18 270)',
  'oklch(72% 0.16 150)',
  'oklch(75% 0.15 75)',
  'oklch(70% 0.15 320)',
  'oklch(70% 0.14 220)',
];

export function TasksView({ workspaceId }: { workspaceId: string }) {
  const { data: sprints = [], isLoading: sprintsLoading } = useSprintsList(workspaceId);
  const { data: tasksPage, isLoading: tasksLoading } = useTasksList(workspaceId, { limit: 100 });
  const { data: members = [] } = useMembers(workspaceId);
  const tasks = tasksPage?.items ?? [];

  const [slideoverDefaults, setSlideoverDefaults] = useState<{ sprintId?: string } | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

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
      <header className="shrink-0 px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--color-fg)] tracking-tight">Tasks</h1>
          <p className="text-[12px] text-[var(--color-fg-muted)] mt-0.5">
            {tasks.length} tasks across {sprints.length} {sprints.length === 1 ? 'sprint' : 'sprints'}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-6 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-[var(--radius-md)] bg-[var(--color-surface)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-[1200px]">
            {sprints.map((sprint, idx) => (
              <TaskGroup
                key={sprint.id}
                title={sprint.name}
                subtitle={sprint.isActive ? 'Active' : undefined}
                color={SPRINT_COLORS[idx % SPRINT_COLORS.length] ?? 'oklch(70% 0.18 270)'}
                tasks={groups.bySprintId.get(sprint.id) ?? []}
                workspaceId={workspaceId}
                members={members}
                onAddTask={() => setSlideoverDefaults({ sprintId: sprint.id })}
                onOpenDetail={setDetailTaskId}
                defaultOpen={sprint.isActive}
              />
            ))}

            <TaskGroup
              title="Backlog"
              color="oklch(60% 0 0)"
              tasks={groups.backlog}
              workspaceId={workspaceId}
              members={members}
              onAddTask={() => setSlideoverDefaults({})}
              onOpenDetail={setDetailTaskId}
              defaultOpen
            />
          </div>
        )}
      </div>

      <CreateTaskSlideover
        workspaceId={workspaceId}
        open={slideoverDefaults !== null}
        onClose={() => setSlideoverDefaults(null)}
        defaultSprintId={slideoverDefaults?.sprintId}
      />

      <TaskDetailPanel
        taskId={detailTaskId}
        workspaceId={workspaceId}
        onClose={() => setDetailTaskId(null)}
      />
    </div>
  );
}

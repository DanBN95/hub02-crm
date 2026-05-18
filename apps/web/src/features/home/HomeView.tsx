import { useMemo } from 'react';
import { useMembers } from '../../lib/members.queries';
import { useSprintsList } from '../sprints/sprints.queries';
import { useTasksList } from '../tasks/tasks.queries';

interface Props {
  workspaceId: string;
  userId: string;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? 'oklch(65% 0.16 155)' : 'var(--color-accent)',
          }}
        />
      </div>
      <span className="text-[12px] tabular-nums text-[var(--color-fg-muted)] shrink-0">{pct}%</span>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-[13px] font-semibold text-[var(--color-fg)]">{title}</h2>
      {count !== undefined && (
        <span className="text-[11px] text-[var(--color-fg-subtle)]">{count}</span>
      )}
    </div>
  );
}

export function HomeView({ workspaceId, userId }: Props) {
  const { data: sprints = [] } = useSprintsList(workspaceId);
  const { data: tasksPage } = useTasksList(workspaceId, { limit: 200 });
  const { data: members = [] } = useMembers(workspaceId);

  const tasks = tasksPage?.items ?? [];

  const activeSprint = sprints.find((s) => s.isActive) ?? null;

  const stats = useMemo(() => {
    const activeSprintTasks = activeSprint
      ? tasks.filter((t) => t.sprintId === activeSprint.id)
      : [];
    const doneTasks = activeSprintTasks.filter((t) => t.status === 'DONE');

    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.dueAt && new Date(t.dueAt) < now && t.status !== 'DONE',
    );

    const myTasks = tasks.filter(
      (t) => t.assignee?.id === userId && t.status !== 'DONE',
    );

    return { activeSprintTasks, doneTasks, overdue, myTasks };
  }, [tasks, activeSprint, userId]);

  const me = members.find((m) => m.id === userId);

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-[20px] font-semibold text-[var(--color-fg)] tracking-tight">
          {me ? `Hey, ${me.name.split(' ')[0]} 👋` : 'Home'}
        </h1>
        <p className="text-[12px] text-[var(--color-fg-muted)] mt-0.5">
          Here's what's on your plate today.
        </p>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-6 max-w-[900px] lg:grid-cols-2">

          {/* Active Sprint Progress */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
            <SectionHeader title="Active Sprint" />
            {activeSprint ? (
              <>
                <p className="text-[14px] font-medium text-[var(--color-fg)] mb-3">{activeSprint.name}</p>
                <ProgressBar value={stats.doneTasks.length} max={stats.activeSprintTasks.length} />
                <p className="text-[11px] text-[var(--color-fg-subtle)] mt-1.5">
                  {stats.doneTasks.length} of {stats.activeSprintTasks.length} tasks done
                </p>

                {stats.activeSprintTasks.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const).map((s) => {
                      const count = stats.activeSprintTasks.filter((t) => t.status === s).length;
                      if (count === 0) return null;
                      const COLORS: Record<string, string> = {
                        BACKLOG:     'oklch(55% 0 0)',
                        TODO:        'oklch(65% 0.14 250)',
                        IN_PROGRESS: 'oklch(72% 0.16 75)',
                        IN_REVIEW:   'oklch(65% 0.18 270)',
                        DONE:        'oklch(65% 0.16 155)',
                      };
                      const LABELS: Record<string, string> = {
                        BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: 'In Progress',
                        IN_REVIEW: 'In Review', DONE: 'Done',
                      };
                      return (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                          style={{ background: `${COLORS[s]}/0.12`, color: COLORS[s] }}
                        >
                          <span className="font-semibold">{count}</span> {LABELS[s]}
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-[13px] text-[var(--color-fg-muted)]">No active sprint</p>
                <p className="text-[11px] text-[var(--color-fg-subtle)] mt-1">
                  Create one in the Sprints view
                </p>
              </div>
            )}
          </div>

          {/* My Tasks */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
            <SectionHeader title="My Tasks" count={stats.myTasks.length} />
            {stats.myTasks.length === 0 ? (
              <p className="text-[12px] text-[var(--color-fg-subtle)] py-4 text-center">
                Nothing assigned to you — enjoy the quiet.
              </p>
            ) : (
              <ul className="space-y-1">
                {stats.myTasks.slice(0, 8).map((task) => {
                  const STATUS_COLORS: Record<string, string> = {
                    BACKLOG: 'oklch(55% 0 0)', TODO: 'oklch(65% 0.14 250)',
                    IN_PROGRESS: 'oklch(72% 0.16 75)', IN_REVIEW: 'oklch(65% 0.18 270)',
                    DONE: 'oklch(65% 0.16 155)',
                  };
                  return (
                    <li key={task.id} className="flex items-center gap-2.5 py-1.5">
                      <span
                        className="shrink-0 w-2 h-2 rounded-full"
                        style={{ background: STATUS_COLORS[task.status] ?? 'oklch(55% 0 0)' }}
                      />
                      <span className="text-[13px] text-[var(--color-fg)] truncate flex-1">{task.title}</span>
                      {task.sprint && (
                        <span className="text-[10px] text-[var(--color-fg-subtle)] shrink-0">{task.sprint.name}</span>
                      )}
                    </li>
                  );
                })}
                {stats.myTasks.length > 8 && (
                  <li className="text-[11px] text-[var(--color-fg-subtle)] pt-1">
                    +{stats.myTasks.length - 8} more
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Overdue */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 lg:col-span-2">
            <SectionHeader title="Overdue" count={stats.overdue.length} />
            {stats.overdue.length === 0 ? (
              <p className="text-[12px] text-[var(--color-fg-subtle)] py-4 text-center">
                No overdue tasks. 🎉
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {stats.overdue.slice(0, 10).map((task) => {
                  const dueDate = new Date(task.dueAt!);
                  const daysAgo = Math.floor((Date.now() - dueDate.getTime()) / 86_400_000);
                  return (
                    <li key={task.id} className="flex items-center gap-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[var(--color-fg)] truncate">{task.title}</p>
                        {task.sprint && (
                          <p className="text-[11px] text-[var(--color-fg-subtle)]">{task.sprint.name}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-[oklch(62%_0.22_25)]">
                        {daysAgo === 0 ? 'Due today' : daysAgo === 1 ? '1d overdue' : `${daysAgo}d overdue`}
                      </span>
                      {task.assignee && (
                        <span className="shrink-0 text-[11px] text-[var(--color-fg-subtle)]">
                          {task.assignee.name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

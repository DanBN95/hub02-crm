import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { useMembers } from '../../lib/members.queries';
import { useSprintsList } from '../sprints/sprints.queries';
import { useTasksList } from '../tasks/tasks.queries';

interface Props {
  workspaceId: string;
  userId: string;
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG:     'oklch(55% 0 0)',
  TODO:        'oklch(65% 0.14 250)',
  IN_PROGRESS: 'oklch(72% 0.16 75)',
  IN_REVIEW:   'oklch(65% 0.18 270)',
  DONE:        'oklch(65% 0.16 155)',
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review', DONE: 'Done',
};

export function HomeView({ workspaceId, userId }: Props) {
  const { data: sprints = [], isLoading: sprintsLoading } = useSprintsList(workspaceId);
  const { data: tasksPage, isLoading: tasksLoading } = useTasksList(workspaceId, { limit: 200 });
  const { data: members = [] } = useMembers(workspaceId);

  const tasks = tasksPage?.items ?? [];
  const isLoading = sprintsLoading || tasksLoading;
  const activeSprint = sprints.find((s) => s.isActive) ?? null;
  const me = members.find((m) => m.id === userId);

  const stats = useMemo(() => {
    const activeSprintTasks = activeSprint ? tasks.filter((t) => t.sprintId === activeSprint.id) : [];
    const doneTasks = activeSprintTasks.filter((t) => t.status === 'DONE');
    const now = new Date();
    const overdue = tasks.filter((t) => t.dueAt && new Date(t.dueAt) < now && t.status !== 'DONE');
    const myTasks = tasks.filter((t) => t.assignee?.id === userId && t.status !== 'DONE');
    return { activeSprintTasks, doneTasks, overdue, myTasks };
  }, [tasks, activeSprint, userId]);

  const sprintPct = stats.activeSprintTasks.length === 0 ? 0
    : Math.round((stats.doneTasks.length / stats.activeSprintTasks.length) * 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <Typography variant="h1" sx={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {me ? `Hey, ${me.name.split(' ')[0]} 👋` : 'Home'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Here's what's on your plate today.
        </Typography>
      </Box>

      {/* Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5, maxWidth: 960 }}>

          {/* Active Sprint */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <BoltIcon sx={{ fontSize: 16, color: 'var(--color-accent)' }} />
                <Typography variant="h3">Active Sprint</Typography>
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="rounded" height={6} sx={{ borderRadius: 999 }} />
                </Box>
              ) : activeSprint ? (
                <>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>{activeSprint.name}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sprintPct}
                    sx={{
                      mb: 0.75,
                      '& .MuiLinearProgress-bar': {
                        background: sprintPct === 100 ? 'oklch(65% 0.16 155)' : 'var(--color-accent)',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {stats.doneTasks.length} of {stats.activeSprintTasks.length} tasks done · {sprintPct}%
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const).map((s) => {
                      const count = stats.activeSprintTasks.filter((t) => t.status === s).length;
                      if (count === 0) return null;
                      return (
                        <Chip
                          key={s}
                          label={`${count} ${STATUS_LABELS[s]}`}
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 20,
                            background: `${STATUS_COLORS[s]}20`,
                            color: STATUS_COLORS[s],
                            border: `1px solid ${STATUS_COLORS[s]}40`,
                          }}
                        />
                      );
                    })}
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No active sprint</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    Create one in the Sprints view
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'var(--color-accent)' }} />
                <Typography variant="h3">My Tasks</Typography>
                {stats.myTasks.length > 0 && (
                  <Chip label={stats.myTasks.length} size="small"
                    sx={{ height: 18, fontSize: 10, ml: 'auto', background: 'rgba(255,255,255,0.08)' }} />
                )}
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} variant="text" height={24} />)}
                </Box>
              ) : stats.myTasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nothing assigned to you — enjoy the quiet.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {stats.myTasks.slice(0, 8).map((task) => (
                    <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: STATUS_COLORS[task.status] ?? STATUS_COLORS.BACKLOG,
                      }} />
                      <Typography sx={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </Typography>
                      {task.sprint && (
                        <Typography variant="caption" sx={{ flexShrink: 0 }}>{task.sprint.name}</Typography>
                      )}
                    </Box>
                  ))}
                  {stats.myTasks.length > 8 && (
                    <Typography variant="caption" sx={{ pt: 0.5 }}>+{stats.myTasks.length - 8} more</Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Overdue — full width */}
          <Card sx={{ gridColumn: { lg: '1 / -1' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <WarningAmberIcon sx={{ fontSize: 16, color: 'oklch(62% 0.22 25)' }} />
                <Typography variant="h3">Overdue</Typography>
                {stats.overdue.length > 0 && (
                  <Chip label={stats.overdue.length} size="small"
                    sx={{ height: 18, fontSize: 10, ml: 'auto', background: 'oklch(62% 0.22 25 / 0.15)', color: 'oklch(62% 0.22 25)' }} />
                )}
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[1, 2].map((i) => <Skeleton key={i} variant="text" height={36} />)}
                </Box>
              ) : stats.overdue.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No overdue tasks. 🎉</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {stats.overdue.slice(0, 10).map((task, i) => {
                    const daysAgo = Math.floor((Date.now() - new Date(task.dueAt!).getTime()) / 86_400_000);
                    return (
                      <Box
                        key={task.id}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 2,
                          py: 1.5,
                          borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.title}
                          </Typography>
                          {task.sprint && (
                            <Typography variant="caption">{task.sprint.name}</Typography>
                          )}
                        </Box>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'oklch(62% 0.22 25)', flexShrink: 0 }}>
                          {daysAgo === 0 ? 'Due today' : daysAgo === 1 ? '1d overdue' : `${daysAgo}d overdue`}
                        </Typography>
                        {task.assignee && (
                          <Typography variant="caption" sx={{ flexShrink: 0 }}>{task.assignee.name}</Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>

        </Box>
      </Box>
    </Box>
  );
}

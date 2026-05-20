import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { useTasksList } from '../tasks/tasks.queries';
import type { TaskWithRelations } from '../tasks/tasks.api';
import { TaskDetailPanel } from '../tasks/components/TaskDetailPanel';
import { useTeamsList, useCreateTeam } from './teams.queries';
import type { Team } from './teams.api';

const PALETTE = [
  '#7c7ff5', '#e07b54', '#54b8e0', '#54e09e',
  '#e054b8', '#e0c254', '#b854e0', '#54e0e0',
];

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'oklch(55% 0 0)',
  TODO: 'oklch(65% 0.14 250)',
  IN_PROGRESS: 'oklch(72% 0.16 75)',
  IN_REVIEW: 'oklch(65% 0.18 270)',
  DONE: 'oklch(65% 0.16 155)',
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review', DONE: 'Done',
};

interface Props {
  workspaceId: string;
}

// ── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, onClick }: { task: TaskWithRelations; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.25,
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'background 100ms',
        '&:hover': { background: 'rgba(255,255,255,0.04)' },
      }}
    >
      {/* Status dot */}
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: STATUS_COLORS[task.status] ?? STATUS_COLORS.BACKLOG,
      }} />

      {/* Title */}
      <Typography sx={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {task.title}
      </Typography>

      {/* Sprint */}
      {task.sprint && (
        <Typography variant="caption" sx={{ flexShrink: 0, color: 'text.disabled' }}>
          {task.sprint.name}
        </Typography>
      )}

      {/* Status chip */}
      <Chip
        label={STATUS_LABELS[task.status]}
        size="small"
        sx={{
          height: 18, fontSize: 10, flexShrink: 0,
          background: `${STATUS_COLORS[task.status]}20`,
          color: STATUS_COLORS[task.status],
          border: `1px solid ${STATUS_COLORS[task.status]}40`,
        }}
      />

      {/* Assignee */}
      {task.assignee && (
        <Tooltip title={task.assignee.name} placement="left">
          <span>
            <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size={22} />
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

// ── New group dialog ───────────────────────────────────────────────────────────
function NewGroupDialog({
  open, workspaceId, onClose,
}: { open: boolean; workspaceId: string; onClose: () => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]!);
  const create = useCreateTeam(workspaceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), color });
    setName('');
    setColor(PALETTE[0]!);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 360 } } }}
    >
      <DialogTitle sx={{ fontSize: 15, fontWeight: 600, pb: 1 }}>New group</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            autoFocus
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="e.g. Engineering"
          />

          {/* Color swatches */}
          <Box>
            <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 1 }}>Color</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {PALETTE.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: c, cursor: 'pointer',
                    outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: 2,
                    transition: 'outline 120ms',
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="text" onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || create.isPending}>
            {create.isPending ? 'Creating…' : 'Create group'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export function TeamsView({ workspaceId }: Props) {
  const { data: teams = [], isLoading: teamsLoading } = useTeamsList(workspaceId);
  const { data: tasksPage, isLoading: tasksLoading } = useTasksList(workspaceId, { limit: 500 });
  const tasks = tasksPage?.items ?? [];

  const [selectedId, setSelectedId] = useState<string | 'general'>('general');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const isLoading = teamsLoading || tasksLoading;

  // Group tasks: null teamId → General
  const generalTasks = tasks.filter((t) => !t.team);
  const tasksForTeam = (teamId: string) => tasks.filter((t) => t.team?.id === teamId);

  const selectedTasks: TaskWithRelations[] = selectedId === 'general'
    ? generalTasks
    : tasksForTeam(selectedId);

  const selectedTeam: Team | undefined = teams.find((t) => t.id === selectedId);
  const selectedLabel = selectedId === 'general' ? 'General' : (selectedTeam?.name ?? '');
  const selectedColor = selectedId === 'general' ? '#7c7ff5' : (selectedTeam?.color ?? '#7c7ff5');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <Typography variant="h1" sx={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Teams
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Organize tasks by interest group or department.
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left sidebar — team list ──────────────────────────────────── */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5, px: 1.5 }}>

            {/* General (always first) */}
            <TeamNavItem
              label="General"
              color="#7c7ff5"
              count={generalTasks.length}
              active={selectedId === 'general'}
              onClick={() => setSelectedId('general')}
            />

            {/* Real teams */}
            {isLoading
              ? [1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={36} sx={{ borderRadius: 1, mb: 0.5 }} />
              ))
              : teams.map((team) => (
                <TeamNavItem
                  key={team.id}
                  label={team.name}
                  color={team.color}
                  count={tasksForTeam(team.id).length}
                  active={selectedId === team.id}
                  onClick={() => setSelectedId(team.id)}
                />
              ))
            }
          </Box>

          {/* New group button */}
          <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Button
              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setDialogOpen(true)}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                fontSize: 12,
                color: 'text.secondary',
                '&:hover': { color: 'text.primary', background: 'rgba(255,255,255,0.05)' },
              }}
            >
              New group
            </Button>
          </Box>
        </Box>

        {/* ── Right — task list ─────────────────────────────────────────── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Section header */}
          <Box
            sx={{
              px: 3, py: 2,
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedColor, flexShrink: 0 }} />
            <Typography variant="h3" sx={{ fontSize: 14, fontWeight: 600 }}>{selectedLabel}</Typography>
            <Chip
              label={selectedTasks.length}
              size="small"
              sx={{ height: 18, fontSize: 10, background: 'rgba(255,255,255,0.08)', ml: 0.5 }}
            />
            <Box sx={{ flex: 1 }} />
            <GroupsIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          </Box>

          {/* Task list */}
          <Box sx={{ flex: 1, overflowY: 'auto', py: 1, px: 1 }}>
            {isLoading ? (
              <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: 1 }} />
                ))}
              </Box>
            ) : selectedTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  No tasks in {selectedLabel} yet.
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  Assign a task to this group from the task detail panel.
                </Typography>
              </Box>
            ) : (
              selectedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => setDetailTaskId(task.id)}
                />
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* New group dialog */}
      <NewGroupDialog
        open={dialogOpen}
        workspaceId={workspaceId}
        onClose={() => setDialogOpen(false)}
      />

      {/* Task detail drawer */}
      <TaskDetailPanel
        taskId={detailTaskId}
        workspaceId={workspaceId}
        onClose={() => setDetailTaskId(null)}
      />
    </Box>
  );
}

// ── Team nav item ─────────────────────────────────────────────────────────────
function TeamNavItem({
  label, color, count, active, onClick,
}: { label: string; color: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 1,
        cursor: 'pointer',
        mb: 0.25,
        background: active ? 'rgba(124,127,245,0.12)' : 'transparent',
        transition: 'background 100ms',
        '&:hover': { background: active ? 'rgba(124,127,245,0.16)' : 'rgba(255,255,255,0.04)' },
        position: 'relative',
      }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 16, borderRadius: '0 2px 2px 0', background: 'var(--color-accent)',
        }} />
      )}
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <Typography
        sx={{
          fontSize: 13, fontWeight: active ? 500 : 400,
          color: active ? 'text.primary' : 'text.secondary',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{count}</Typography>
    </Box>
  );
}

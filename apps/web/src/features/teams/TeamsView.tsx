import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '../../components/ui/Avatar';
import { useNotify } from '../../context/NotificationContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { workspacesApi, type WorkspaceMember } from '../../lib/workspaces';
import { useMembers } from '../../lib/members.queries';
import { useTasksList } from '../tasks/tasks.queries';
import type { TaskWithRelations } from '../tasks/tasks.api';
import { TaskDetailPanel } from '../tasks/components/TaskDetailPanel';
import { useTeamsList, useCreateTeam, useAddTeamMember, useRemoveTeamMember } from './teams.queries';
import type { Team, TeamMember } from './teams.api';

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

const ROLE_LABELS: Record<string, string> = {
  viewer: 'Viewer',
  editor: 'Editor',
  admin: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  viewer: 'rgba(255,255,255,0.08)',
  editor: 'rgba(124,127,245,0.15)',
  admin: 'rgba(239,180,68,0.15)',
};

const ROLE_TEXT_COLORS: Record<string, string> = {
  viewer: 'oklch(65% 0 0)',
  editor: 'var(--color-accent)',
  admin: 'oklch(75% 0.16 85)',
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
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: STATUS_COLORS[task.status] ?? STATUS_COLORS.BACKLOG,
      }} />
      <Typography sx={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {task.title}
      </Typography>
      {task.sprint && (
        <Typography variant="caption" sx={{ flexShrink: 0, color: 'text.disabled' }}>
          {task.sprint.name}
        </Typography>
      )}
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

// ── Workspace Members section ─────────────────────────────────────────────────
function WorkspaceMembersSection({ workspaceId }: { workspaceId: string }) {
  const { notify, confirm } = useNotify();
  const { user, role: currentUserRole } = useWorkspace();
  const queryClient = useQueryClient();
  const isAdmin = currentUserRole === 'admin';

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => workspacesApi.members(workspaceId),
  });

  const handleRoleChange = async (member: WorkspaceMember, newRole: string) => {
    try {
      await workspacesApi.updateMemberRole(workspaceId, member.id, newRole);
      await queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      notify(`${member.name}'s role updated to ${ROLE_LABELS[newRole] ?? newRole}`, 'success');
    } catch {
      notify('Failed to update role', 'error');
    }
  };

  const handleRemove = async (member: WorkspaceMember) => {
    const ok = await confirm(`Remove ${member.name} from the workspace?`, 'Remove member');
    if (!ok) return;
    try {
      await workspacesApi.removeMember(workspaceId, member.id);
      await queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      notify(`${member.name} removed`, 'success');
    } catch {
      notify('Failed to remove member', 'error');
    }
  };

  return (
    <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>
        Workspace Members
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {members.map((member) => {
            const isSelf = member.id === user?.id;
            return (
              <Box
                key={member.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  '&:hover': { background: 'rgba(255,255,255,0.03)' },
                }}
              >
                <Avatar name={member.name} avatarUrl={member.avatarUrl} size={28} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.name}{isSelf ? ' (you)' : ''}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{member.email}</Typography>
                </Box>

                {isAdmin && !isSelf ? (
                  <Select
                    value={member.role}
                    size="small"
                    onChange={(e) => handleRoleChange(member, e.target.value)}
                    sx={{
                      fontSize: 11,
                      height: 26,
                      minWidth: 80,
                      '.MuiSelect-select': { py: 0.25, px: 1 },
                    }}
                  >
                    <MenuItem value="viewer" sx={{ fontSize: 12 }}>Viewer</MenuItem>
                    <MenuItem value="editor" sx={{ fontSize: 12 }}>Editor</MenuItem>
                    <MenuItem value="admin" sx={{ fontSize: 12 }}>Admin</MenuItem>
                  </Select>
                ) : (
                  <Chip
                    label={ROLE_LABELS[member.role] ?? member.role}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      background: ROLE_COLORS[member.role] ?? 'rgba(255,255,255,0.08)',
                      color: ROLE_TEXT_COLORS[member.role] ?? 'text.secondary',
                      border: '1px solid transparent',
                    }}
                  />
                )}

                {isAdmin && !isSelf && (
                  <Tooltip title="Remove from workspace">
                    <Box
                      onClick={() => handleRemove(member)}
                      sx={{
                        cursor: 'pointer',
                        color: 'text.disabled',
                        fontSize: 12,
                        px: 0.5,
                        borderRadius: 0.5,
                        transition: 'color 120ms',
                        '&:hover': { color: 'error.main' },
                      }}
                    >
                      ✕
                    </Box>
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Box>
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
    <Dialog open={open} onClose={onClose} slotProps={{ paper: { sx: { width: 360 } } }}>
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
          <Box>
            <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 1 }}>Color</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {PALETTE.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                    outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: 2, transition: 'outline 120ms',
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

// ── Add member dialog ──────────────────────────────────────────────────────────
function AddMemberDialog({
  open,
  onClose,
  workspaceId,
  teamId,
  existingMembers,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  teamId: string;
  existingMembers: TeamMember[];
}) {
  const { notify } = useNotify();
  const { data: allMembers = [] } = useMembers(workspaceId);
  const addMember = useAddTeamMember(workspaceId);
  const [search, setSearch] = useState('');

  const existingIds = new Set(existingMembers.map((m) => m.id));
  const available = allMembers.filter(
    (m) => !existingIds.has(m.id) && m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async (userId: string, name: string) => {
    try {
      await addMember.mutateAsync({ teamId, userId });
      notify(`${name} added to group`, 'success');
      onClose();
      setSearch('');
    } catch {
      notify('Failed to add member', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={() => { onClose(); setSearch(''); }} slotProps={{ paper: { sx: { width: 360 } } }}>
      <DialogTitle sx={{ fontSize: 15, fontWeight: 600, pb: 1 }}>Add member</DialogTitle>
      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          autoFocus
          size="small"
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        {available.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: 'text.disabled', py: 2, textAlign: 'center' }}>
            {allMembers.length === existingMembers.length
              ? 'All workspace members are already in this group.'
              : 'No members match your search.'}
          </Typography>
        ) : (
          <MenuList sx={{ p: 0, maxHeight: 280, overflowY: 'auto' }}>
            {available.map((m) => (
              <MenuItem
                key={m.id}
                onClick={() => handleAdd(m.id, m.name)}
                disabled={addMember.isPending}
                sx={{ gap: 1.5, borderRadius: 1, px: 1.5, py: 1 }}
              >
                <Avatar name={m.name} avatarUrl={m.avatarUrl} size={28} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{m.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{m.email}</Typography>
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="text" onClick={() => { onClose(); setSearch(''); }} sx={{ color: 'text.secondary' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Members strip ──────────────────────────────────────────────────────────────
function MembersStrip({
  members,
  teamId,
  workspaceId,
  onAddClick,
}: {
  members: TeamMember[];
  teamId: string;
  workspaceId: string;
  onAddClick: () => void;
}) {
  const { notify, confirm } = useNotify();
  const removeMember = useRemoveTeamMember(workspaceId);

  const handleRemove = async (member: TeamMember) => {
    const ok = await confirm(`Remove ${member.name} from this group?`, 'Remove member');
    if (!ok) return;
    try {
      await removeMember.mutateAsync({ teamId, userId: member.id });
      notify(`${member.name} removed`, 'success');
    } catch {
      notify('Failed to remove member', 'error');
    }
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.07em', mr: 0.5 }}>
        Members
      </Typography>

      {members.length === 0 && (
        <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic' }}>None yet</Typography>
      )}

      {members.map((m) => (
        <Tooltip key={m.id} title={`${m.name} — click to remove`} placement="top">
          <Box
            onClick={() => handleRemove(m)}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '50%',
              '&:hover .remove-ring': { opacity: 1 },
            }}
          >
            <Avatar name={m.name} avatarUrl={m.avatarUrl} size={28} />
            <Box
              className="remove-ring"
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'oklch(0% 0 0 / 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 120ms',
                fontSize: 11,
                color: '#fff',
                fontWeight: 700,
              }}
            >
              ✕
            </Box>
          </Box>
        </Tooltip>
      ))}

      <Tooltip title="Add member">
        <Box
          onClick={onAddClick}
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1.5px dashed rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'text.disabled',
            transition: 'border-color 120ms, color 120ms',
            '&:hover': { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' },
          }}
        >
          <PersonAddOutlinedIcon sx={{ fontSize: 14 }} />
        </Box>
      </Tooltip>
    </Box>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export function TeamsView({ workspaceId }: Props) {
  const { data: teams = [], isLoading: teamsLoading } = useTeamsList(workspaceId);
  const { data: tasksPage, isLoading: tasksLoading } = useTasksList(workspaceId, { limit: 500 });
  const tasks = tasksPage?.items ?? [];

  const [selectedId, setSelectedId] = useState<string | 'general'>('general');
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const isLoading = teamsLoading || tasksLoading;

  const generalTasks = tasks.filter((t) => !t.team);
  const tasksForTeam = (teamId: string) => tasks.filter((t) => t.team?.id === teamId);

  const selectedTasks: TaskWithRelations[] = selectedId === 'general'
    ? generalTasks
    : tasksForTeam(selectedId);

  const selectedTeam: Team | undefined = teams.find((t) => t.id === selectedId);
  const selectedLabel = selectedId === 'general' ? 'General' : (selectedTeam?.name ?? '');
  const selectedColor = selectedId === 'general' ? '#7c7ff5' : (selectedTeam?.color ?? '#7c7ff5');
  const selectedMembers: TeamMember[] = selectedId === 'general' ? [] : (selectedTeam?.members ?? []);

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

      {/* Workspace Members */}
      <WorkspaceMembersSection workspaceId={workspaceId} />

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <Box
          sx={{
            width: 220, flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5, px: 1.5 }}>
            <TeamNavItem
              label="General"
              color="#7c7ff5"
              count={generalTasks.length}
              active={selectedId === 'general'}
              onClick={() => setSelectedId('general')}
            />
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

          <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Button
              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setNewGroupOpen(true)}
              fullWidth
              sx={{
                justifyContent: 'flex-start', fontSize: 12, color: 'text.secondary',
                '&:hover': { color: 'text.primary', background: 'rgba(255,255,255,0.05)' },
              }}
            >
              New group
            </Button>
          </Box>
        </Box>

        {/* ── Right panel ──────────────────────────────────────────────── */}
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

          {/* Members strip — only for real teams */}
          {selectedId !== 'general' && selectedTeam && (
            <MembersStrip
              members={selectedMembers}
              teamId={selectedTeam.id}
              workspaceId={workspaceId}
              onAddClick={() => setAddMemberOpen(true)}
            />
          )}

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
                <TaskRow key={task.id} task={task} onClick={() => setDetailTaskId(task.id)} />
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Dialogs */}
      <NewGroupDialog
        open={newGroupOpen}
        workspaceId={workspaceId}
        onClose={() => setNewGroupOpen(false)}
      />

      {selectedTeam && (
        <AddMemberDialog
          open={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          workspaceId={workspaceId}
          teamId={selectedTeam.id}
          existingMembers={selectedMembers}
        />
      )}

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
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1, borderRadius: 1, cursor: 'pointer', mb: 0.25,
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

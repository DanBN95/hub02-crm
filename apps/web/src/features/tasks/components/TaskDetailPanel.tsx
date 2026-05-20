import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTeamsList } from '../../teams/teams.queries';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../../components/ui/Avatar';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { useMembers } from '../../../lib/members.queries';
import { useComments, useCreateComment, useDeleteComment } from '../comments.queries';
import { useTaskDetail, useUpdateTask } from '../tasks.queries';
import type { TaskWithRelations } from '../tasks.api';
import { DueDateCell } from './cells/DueDateCell';
import { OwnerCell } from './cells/OwnerCell';
import { PriorityCell } from './cells/PriorityCell';
import { StatusCell } from './cells/StatusCell';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function renderContent(text: string) {
  const parts = text.split(/(@\w[\w\s]*?\b)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} style={{ color: 'var(--color-accent)' }}>{part}</span>
    ) : (
      part
    ),
  );
}

// ── Property row: label on left, value on right, bg revealed on hover ─────
function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 1,
        py: 1,
        mx: -1,
        borderRadius: 1,
        cursor: 'default',
        transition: 'background 100ms',
        '&:hover': { background: 'rgba(255,255,255,0.04)' },
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          color: 'text.disabled',
          width: 72,
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

interface PanelContentProps {
  task: TaskWithRelations;
  workspaceId: string;
  onClose: () => void;
}

function PanelContent({ task, workspaceId, onClose }: PanelContentProps) {
  const update = useUpdateTask(workspaceId);
  const { data: members = [] } = useMembers(workspaceId);
  const { data: teams = [] } = useTeamsList(workspaceId);
  const { data: comments = [], isLoading: commentsLoading } = useComments(task.id);
  const createComment = useCreateComment(task.id);
  const deleteComment = useDeleteComment(task.id);
  const { user } = useWorkspace();

  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [draft, setDraft] = useState('');
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTitleDraft(task.title); }, [task.title]);
  useEffect(() => { setDescription(task.description ?? ''); }, [task.description]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [comments.length]);

  const saveTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== task.title) update.mutate({ id: task.id, dto: { title: next } });
    else setTitleDraft(task.title);
    setTitleEditing(false);
  };

  const saveDescription = () => {
    if (description !== (task.description ?? ''))
      update.mutate({ id: task.id, dto: { description: description || undefined } });
  };

  const submitComment = () => {
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    createComment.mutate(content);
  };

  const currentUser = user
    ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl }
    : (members[0] ?? { id: '', name: 'You', avatarUrl: null });

  const shortId = task.id.slice(-6).toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* ID badge */}
        <Typography
          component="span"
          sx={{
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 500,
            px: 1,
            py: 0.5,
            borderRadius: 0.75,
            background: 'rgba(255,255,255,0.06)',
            color: 'text.disabled',
            flexShrink: 0,
            userSelect: 'all',
            letterSpacing: '0.04em',
          }}
        >
          HUB-{shortId}
        </Typography>

        {/* Sprint chip */}
        {task.sprint && (
          <Chip
            label={task.sprint.name}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 500,
              background: 'oklch(65% 0.18 270 / 0.12)',
              color: 'var(--color-accent)',
              border: '1px solid oklch(65% 0.18 270 / 0.2)',
            }}
          />
        )}

        <Box sx={{ flex: 1 }} />

        {/* Close */}
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close task"
          sx={{
            color: 'text.disabled',
            '&:hover': { color: 'text.primary', background: 'rgba(255,255,255,0.06)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Title */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
          {titleEditing ? (
            <textarea
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); saveTitle(); }
                if (e.key === 'Escape') { setTitleDraft(task.title); setTitleEditing(false); }
              }}
              rows={2}
              style={{
                width: '100%',
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.35,
                color: 'var(--color-fg)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-accent)',
                borderRadius: 6,
                outline: 'none',
                resize: 'none',
                padding: '6px 8px',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <Typography
              component="h1"
              onClick={() => setTitleEditing(true)}
              sx={{
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.35,
                cursor: 'text',
                px: 1,
                py: 0.75,
                mx: -1,
                borderRadius: 1,
                transition: 'background 100ms',
                '&:hover': { background: 'rgba(255,255,255,0.04)' },
              }}
            >
              {task.title}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Properties */}
        <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <PropertyRow label="Status">
            <StatusCell taskId={task.id} status={task.status as any} workspaceId={workspaceId} />
          </PropertyRow>
          <PropertyRow label="Priority">
            <PriorityCell taskId={task.id} priority={task.priority as any} workspaceId={workspaceId} />
          </PropertyRow>
          <PropertyRow label="Owner">
            <OwnerCell taskId={task.id} assignee={task.assignee} members={members} workspaceId={workspaceId} />
          </PropertyRow>
          <PropertyRow label="Due date">
            <DueDateCell taskId={task.id} dueAt={task.dueAt} workspaceId={workspaceId} />
          </PropertyRow>
          <PropertyRow label="Group">
            <Select
              size="small"
              displayEmpty
              value={task.team?.id ?? ''}
              onChange={(e) => update.mutate({ id: task.id, dto: { teamId: e.target.value || null } as any })}
              sx={{
                fontSize: 12,
                height: 28,
                minWidth: 120,
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-accent)', borderWidth: 1 },
                '.MuiSelect-select': { py: '4px', px: '10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 1 },
                background: 'rgba(255,255,255,0.03)',
              }}
              renderValue={(val) => {
                const team = teams.find((t) => t.id === val);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: team?.color ?? '#7c7ff5', flexShrink: 0 }} />
                    <span style={{ fontSize: 12 }}>{team?.name ?? 'General'}</span>
                  </Box>
                );
              }}
            >
              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c7ff5' }} />
                  <em style={{ fontSize: 12, fontStyle: 'normal' }}>General</em>
                </Box>
              </MenuItem>
              {teams.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                    {t.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </PropertyRow>
        </Box>

        <Divider />

        {/* Description */}
        <Box sx={{ px: 2.5, py: 2.5 }}>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 1.5,
            }}
          >
            Description
          </Typography>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description…"
            rows={3}
            style={{
              width: '100%',
              fontSize: 13,
              color: 'var(--color-fg)',
              lineHeight: 1.6,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              padding: '8px 10px',
              marginLeft: -10,
              borderRadius: 6,
              transition: 'background 100ms',
            }}
            onFocus={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onBlur={(e) => { e.currentTarget.style.background = 'transparent'; saveDescription(); }}
            onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = 'transparent'; }}
          />
        </Box>

        <Divider />

        {/* Updates header */}
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, pt: 2.5, pb: 1.5 }}>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Updates
          </Typography>
          <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          {comments.length > 0 && (
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{comments.length}</Typography>
          )}
        </Box>

        {/* Feed */}
        <Box
          ref={feedRef}
          sx={{ flex: 1, overflowY: 'auto', px: 2.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
          aria-live="polite"
        >
          {commentsLoading && (
            <>
              {[1, 2].map((i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                  <Skeleton variant="circular" width={28} height={28} sx={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" height={14} />
                    <Skeleton variant="text" width="80%" height={14} />
                  </Box>
                </Box>
              ))}
            </>
          )}
          {!commentsLoading && comments.length === 0 && (
            <Typography
              variant="body2"
              sx={{ color: 'text.disabled', textAlign: 'center', py: 4 }}
            >
              No updates yet. Be the first to add one.
            </Typography>
          )}
          {comments.map((c) => (
            <Box
              key={c.id}
              sx={{ display: 'flex', gap: 1.5, '&:hover .delete-btn': { opacity: 1 } }}
            >
              <Avatar name={c.user.name} avatarUrl={c.user.avatarUrl} size={28} className="mt-0.5 shrink-0" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{c.user.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{relativeTime(c.createdAt)}</Typography>
                  <Box
                    component="button"
                    className="delete-btn"
                    onClick={() => deleteComment.mutate(c.id)}
                    aria-label="Delete comment"
                    sx={{
                      ml: 'auto',
                      opacity: 0,
                      fontSize: 11,
                      color: 'text.disabled',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 100ms, color 100ms',
                      '&:hover': { color: 'error.main' },
                      p: 0,
                    }}
                  >
                    ✕
                  </Box>
                </Box>
                <Typography
                  sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-words' }}
                >
                  {renderContent(c.content)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Composer */}
        <Box
          sx={{
            flexShrink: 0,
            px: 2.5,
            py: 2,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
            <Avatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size={28} className="mb-1 shrink-0" />
            <Box
              sx={{
                flex: 1,
                borderRadius: 1,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 150ms',
                '&:focus-within': { borderColor: 'var(--color-accent)' },
              }}
            >
              <textarea
                ref={composerRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment();
                }}
                placeholder="Write an update… (@mention teammates)"
                rows={1}
                style={{
                  width: '100%',
                  background: 'transparent',
                  fontSize: 13,
                  color: 'var(--color-fg)',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  padding: '10px 12px 4px',
                  fontFamily: 'inherit',
                  minHeight: 38,
                  maxHeight: 120,
                  lineHeight: 1.45,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, pb: 1.25 }}>
                <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>⌘+Enter to post</Typography>
                <Box
                  component="button"
                  onClick={submitComment}
                  disabled={!draft.trim() || createComment.isPending}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    fontSize: 12,
                    fontWeight: 500,
                    background: 'var(--color-accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 0.75,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 100ms, transform 100ms',
                    '&:hover:not(:disabled)': { opacity: 0.88 },
                    '&:active:not(:disabled)': { transform: 'scale(0.97)' },
                    '&:disabled': { opacity: 0.3, cursor: 'not-allowed' },
                  }}
                >
                  Post
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

interface TaskDetailPanelProps {
  taskId: string | null;
  workspaceId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, workspaceId, onClose }: TaskDetailPanelProps) {
  const { data: task } = useTaskDetail(taskId ?? '');

  return (
    <Drawer
      anchor="right"
      open={!!taskId}
      onClose={onClose}
      transitionDuration={{ enter: 240, exit: 180 }}
      slotProps={{
        paper: {
          sx: { width: 500, maxWidth: '100vw' },
        },
        backdrop: {
          sx: { background: 'oklch(0% 0 0 / 0.45)' },
        },
        transition: {
          easing: {
            enter: 'cubic-bezier(0.32, 0.72, 0, 1)',
            exit: 'cubic-bezier(0.32, 0.72, 0, 1)',
          },
        } as any,
      }}
    >
      {task ? (
        <PanelContent task={task} workspaceId={workspaceId} onClose={onClose} />
      ) : (
        // Loading skeleton while task data arrives
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="rounded" height={6} sx={{ borderRadius: 999 }} />
          <Skeleton variant="text" width="80%" height={16} />
          <Skeleton variant="text" width="70%" height={16} />
        </Box>
      )}
    </Drawer>
  );
}

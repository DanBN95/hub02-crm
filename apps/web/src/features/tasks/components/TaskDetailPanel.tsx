import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

// ── Section divider ────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0' }} />;
}

// ── Property row: label on left, value on right, bg revealed on hover ─────
function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-2.5 -mx-1 rounded-[var(--radius-md)] cursor-default
                 transition-colors duration-100"
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      <span className="text-[11px] text-[var(--color-fg-subtle)] w-[72px] shrink-0 select-none">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface PanelProps {
  task: TaskWithRelations;
  workspaceId: string;
  onClose: () => void;
}

function Panel({ task, workspaceId, onClose }: PanelProps) {
  const update = useUpdateTask(workspaceId);
  const { data: members = [] } = useMembers(workspaceId);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const shortId = task.id.slice(-6).toUpperCase();

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'oklch(0% 0 0 / 0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — glass surface */}
      <div
        role="dialog"
        aria-label={`Task: ${task.title}`}
        className="fixed inset-y-0 right-0 z-50 w-[500px] max-w-full flex flex-col overflow-hidden"
        style={{
          background: 'color-mix(in oklch, var(--color-surface) 88%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-12px 0 48px oklch(0% 0 0 / 0.4)',
          animation: 'slideInRight 220ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          className="shrink-0 flex items-center gap-2.5 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded
                           bg-[var(--color-surface-2)] text-[var(--color-fg-subtle)] shrink-0 select-all">
            HUB-{shortId}
          </span>
          {task.sprint && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full shrink-0 font-medium"
              style={{ background: 'oklch(65% 0.18 270 / 0.12)', color: 'var(--color-accent)' }}
            >
              {task.sprint.name}
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-fg-subtle)]
                       hover:text-[var(--color-fg)] hover:bg-[rgba(255,255,255,0.06)]
                       transition-colors outline-none
                       focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Close task"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Title */}
          <div className="px-5 pt-6 pb-5">
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
                className="w-full text-[17px] font-semibold text-[var(--color-fg)] leading-snug
                           rounded-[var(--radius-md)] border outline-none resize-none px-2 py-1"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: 'var(--color-accent)',
                }}
              />
            ) : (
              <h1
                onClick={() => setTitleEditing(true)}
                className="text-[17px] font-semibold text-[var(--color-fg)] leading-snug
                           cursor-text px-2 py-1 -mx-2 rounded-[var(--radius-md)]
                           transition-colors duration-100"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                {task.title}
              </h1>
            )}
          </div>

          <Divider />

          {/* Properties — hover-reveal containers */}
          <div className="px-5 py-5 flex flex-col gap-1">
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
          </div>

          <Divider />

          {/* Description */}
          <div className="px-5 py-5">
            <span className="block text-[10px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider mb-3">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              placeholder="Add a description…"
              rows={3}
              className="w-full text-[13px] text-[var(--color-fg)] leading-relaxed
                         placeholder:text-[var(--color-fg-subtle)]
                         resize-none outline-none px-3 py-2.5 -mx-3 rounded-[var(--radius-md)]
                         transition-colors duration-100"
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.background = ''; saveDescription(); }}
              onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) (e.currentTarget as HTMLElement).style.background = ''; }}
            />
          </div>

          <Divider />

          {/* Updates header */}
          <div className="shrink-0 px-5 pt-5 pb-3 flex items-center gap-3">
            <span className="text-[10px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider">
              Updates
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            {comments.length > 0 && (
              <span className="text-[11px] text-[var(--color-fg-subtle)]">{comments.length}</span>
            )}
          </div>

          {/* Feed */}
          <div ref={feedRef} className="flex-1 overflow-y-auto px-5 pb-4 space-y-5" aria-live="polite">
            {commentsLoading && (
              <div className="space-y-4 py-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-surface-2)] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 w-24 bg-[var(--color-surface-2)] rounded" />
                      <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!commentsLoading && comments.length === 0 && (
              <p className="text-[12px] text-[var(--color-fg-subtle)] text-center py-8">
                No updates yet. Be the first to add one.
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 group/comment">
                <Avatar name={c.user.name} avatarUrl={c.user.avatarUrl} size={28} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-[var(--color-fg)]">{c.user.name}</span>
                    <span className="text-[11px] text-[var(--color-fg-subtle)]">{relativeTime(c.createdAt)}</span>
                    <button
                      onClick={() => deleteComment.mutate(c.id)}
                      className="ml-auto opacity-0 group-hover/comment:opacity-100 text-[11px]
                                 text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)]
                                 transition-opacity duration-100 outline-none"
                      aria-label="Delete comment"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[13px] text-[var(--color-fg-muted)] leading-relaxed whitespace-pre-wrap break-words">
                    {renderContent(c.content)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div
            className="shrink-0 px-5 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex gap-3 items-end">
              <Avatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size={28} className="mb-1 shrink-0" />
              <div
                className="flex-1 rounded-[var(--radius-md)] overflow-hidden
                           transition-colors duration-100"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; }}
                onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
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
                  className="w-full bg-transparent text-[13px] text-[var(--color-fg)]
                             placeholder:text-[var(--color-fg-subtle)]
                             px-3 py-2.5 outline-none resize-none leading-snug"
                  style={{ minHeight: '38px', maxHeight: '120px' }}
                />
                <div className="flex justify-between items-center px-3 pb-2.5">
                  <span className="text-[10px] text-[var(--color-fg-subtle)]">⌘+Enter to post</span>
                  <button
                    onClick={submitComment}
                    disabled={!draft.trim() || createComment.isPending}
                    className="px-3 py-1 text-[12px] font-medium
                               bg-[var(--color-accent)] text-white rounded-[var(--radius-md)]
                               hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed
                               transition-all duration-100
                               focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 outline-none"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>,
    document.body,
  );
}

interface TaskDetailPanelProps {
  taskId: string | null;
  workspaceId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, workspaceId, onClose }: TaskDetailPanelProps) {
  const { data: task } = useTaskDetail(taskId ?? '');
  if (!taskId || !task) return null;
  return <Panel task={task} workspaceId={workspaceId} onClose={onClose} />;
}

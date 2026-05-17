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
      <span key={i} style={{ color: 'var(--color-accent)' }}>
        {part}
      </span>
    ) : (
      part
    ),
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
  const { workspace } = useWorkspace();

  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [draft, setDraft] = useState('');
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Sync if task changes externally
  useEffect(() => { setTitleDraft(task.title); }, [task.title]);
  useEffect(() => { setDescription(task.description ?? ''); }, [task.description]);

  // Scroll feed to bottom on new comment
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [comments.length]);

  const saveTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== task.title) update.mutate({ id: task.id, dto: { title: next } });
    else setTitleDraft(task.title);
    setTitleEditing(false);
  };

  const saveDescription = () => {
    if (description !== (task.description ?? '')) {
      update.mutate({ id: task.id, dto: { description: description || undefined } });
    }
  };

  const submitComment = () => {
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    createComment.mutate(content);
  };

  // Current user (first member matching workspace member — simple heuristic for now)
  const currentUser = members[0] ?? { id: '', name: 'You', avatarUrl: null };

  // Close on Escape
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
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label={`Task: ${task.title}`}
        className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-full
                   bg-[var(--color-surface)] border-l border-[var(--color-border)]
                   shadow-[-8px_0_32px_oklch(0%_0_0/0.35)]
                   flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 200ms ease-out' }}
      >
        {/* Header */}
        <header className="shrink-0 flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border)]">
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5
                           bg-[var(--color-surface-2)] text-[var(--color-fg-subtle)]
                           rounded-[var(--radius-md)] shrink-0 select-all">
            HUB-{shortId}
          </span>
          {task.sprint && (
            <span className="text-[11px] px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'oklch(65% 0.18 270 / 0.12)', color: 'var(--color-accent)' }}>
              {task.sprint.name}
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-fg-subtle)]
                       hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]
                       transition-colors outline-none
                       focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Close task"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title */}
          <div className="px-5 pt-4 pb-3">
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
                className="w-full text-[16px] font-semibold text-[var(--color-fg)] leading-snug
                           bg-[var(--color-surface-2)] rounded-[var(--radius-md)]
                           border border-[var(--color-accent)] outline-none resize-none
                           px-2 py-1"
              />
            ) : (
              <h1
                onClick={() => setTitleEditing(true)}
                className="text-[16px] font-semibold text-[var(--color-fg)] leading-snug
                           cursor-text hover:bg-[var(--color-surface-2)] px-2 py-1 -mx-2
                           rounded-[var(--radius-md)] transition-colors"
              >
                {task.title}
              </h1>
            )}
          </div>

          {/* Properties */}
          <div className="px-5 pb-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              {
                label: 'Status',
                node: <StatusCell taskId={task.id} status={task.status as any} workspaceId={workspaceId} />,
              },
              {
                label: 'Priority',
                node: <PriorityCell taskId={task.id} priority={task.priority as any} workspaceId={workspaceId} />,
              },
              {
                label: 'Owner',
                node: (
                  <OwnerCell
                    taskId={task.id}
                    assignee={task.assignee}
                    members={members}
                    workspaceId={workspaceId}
                  />
                ),
              },
              {
                label: 'Due date',
                node: <DueDateCell taskId={task.id} dueAt={task.dueAt} workspaceId={workspaceId} />,
              },
            ].map(({ label, node }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[var(--color-fg-subtle)] uppercase tracking-wide">
                  {label}
                </span>
                {node}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="px-5 pb-5 border-b border-[var(--color-border)]">
            <span className="text-[10px] font-medium text-[var(--color-fg-subtle)] uppercase tracking-wide block mb-1.5">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              placeholder="Add a description…"
              rows={3}
              className="w-full bg-transparent text-[13px] text-[var(--color-fg)]
                         placeholder:text-[var(--color-fg-subtle)] leading-relaxed
                         resize-none outline-none
                         hover:bg-[var(--color-surface-2)] focus:bg-[var(--color-surface-2)]
                         px-2 py-1.5 -mx-2 rounded-[var(--radius-md)]
                         transition-colors duration-100"
            />
          </div>

          {/* Updates header */}
          <div className="shrink-0 px-5 py-3 flex items-center gap-3">
            <span className="text-[11px] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wide">
              Updates
            </span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            {comments.length > 0 && (
              <span className="text-[11px] text-[var(--color-fg-subtle)]">{comments.length}</span>
            )}
          </div>

          {/* Feed */}
          <div ref={feedRef} className="flex-1 overflow-y-auto px-5 pb-2 space-y-4" aria-live="polite">
            {commentsLoading && (
              <div className="space-y-3 py-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-2.5 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-surface-2)] shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-24 bg-[var(--color-surface-2)] rounded" />
                      <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!commentsLoading && comments.length === 0 && (
              <p className="text-[12px] text-[var(--color-fg-subtle)] text-center py-6">
                No updates yet. Be the first to add one.
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 group">
                <Avatar name={c.user.name} avatarUrl={c.user.avatarUrl} size={24} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-[12px] font-semibold text-[var(--color-fg)]">{c.user.name}</span>
                    <span className="text-[11px] text-[var(--color-fg-subtle)]">{relativeTime(c.createdAt)}</span>
                    <button
                      onClick={() => deleteComment.mutate(c.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-[11px]
                                 text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)]
                                 transition-all outline-none"
                      aria-label="Delete comment"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[13px] text-[var(--color-fg-muted)] leading-snug whitespace-pre-wrap break-words">
                    {renderContent(c.content)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-[var(--color-border)] px-5 py-3">
            <div className="flex gap-2.5 items-end">
              <Avatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size={24} className="mb-1 shrink-0" />
              <div className="flex-1 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]
                              border border-[var(--color-border)] focus-within:border-[var(--color-accent)]
                              transition-colors overflow-hidden">
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
                             px-3 py-2 outline-none resize-none leading-snug"
                  style={{ minHeight: '36px', maxHeight: '120px' }}
                />
                <div className="flex justify-between items-center px-2 pb-2">
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

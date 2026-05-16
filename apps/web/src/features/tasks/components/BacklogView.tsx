import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useDeleteTask, useTasksList, useUpdateTask, useBulkDelete, useBulkStatus } from '../tasks.queries';
import { CreateTaskSlideover } from './CreateTaskSlideover';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { TaskWithRelations } from '../tasks.api';

const DEMO_WORKSPACE = import.meta.env['VITE_WORKSPACE_ID'] ?? 'demo';

const STATUS_OPTIONS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-[var(--color-border)]">
          {[1, 2, 3, 4, 5].map((j) => (
            <td key={j} className="px-3 py-2.5">
              <div className="h-4 rounded bg-[var(--color-surface-2)] animate-pulse" style={{ width: `${60 + j * 10}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <tr>
      <td colSpan={6} className="py-16 text-center">
        <p className="text-[13px] text-[var(--color-fg-muted)] mb-3">No tasks yet</p>
        <Button variant="primary" size="sm" onClick={onNew}>Create task</Button>
      </td>
    </tr>
  );
}

function formatDate(d: Date | null | undefined) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(d));
}

interface TaskRowProps {
  task: TaskWithRelations;
  selected: boolean;
  onToggle: () => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onDelete: (id: string) => void;
}

function TaskRow({ task, selected, onToggle, onUpdate, onDelete }: TaskRowProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [hovered, setHovered] = useState(false);

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== task.title) {
      onUpdate(task.id, 'title', titleDraft.trim());
    } else {
      setTitleDraft(task.title);
    }
    setEditingTitle(false);
  };

  return (
    <tr
      className={`border-b border-[var(--color-border)] group transition-colors ${selected ? 'bg-[var(--color-accent)]/5' : 'hover:bg-[var(--color-surface-2)]'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="w-8 pl-3 py-2.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="rounded accent-[var(--color-accent)]"
          aria-label={`Select ${task.title}`}
        />
      </td>
      <td className="px-3 py-2.5 max-w-xs">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleDraft(task.title); setEditingTitle(false); } }}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-accent)] rounded px-2 py-0.5 text-[13px] text-[var(--color-fg)] outline-none"
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={() => setEditingTitle(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(true); }}
            className="text-[13px] text-[var(--color-fg)] truncate block cursor-text hover:text-[var(--color-accent)]"
          >
            {task.title}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <TaskStatusBadge
          status={task.status as Parameters<typeof TaskStatusBadge>[0]['status']}
          onClick={() => {
            const cur = STATUS_OPTIONS.indexOf(task.status as typeof STATUS_OPTIONS[number]);
            const next = STATUS_OPTIONS[(cur + 1) % STATUS_OPTIONS.length];
            if (next) onUpdate(task.id, 'status', next);
          }}
        />
      </td>
      <td className="px-3 py-2.5">
        <TaskPriorityBadge
          priority={task.priority as Parameters<typeof TaskPriorityBadge>[0]['priority']}
        />
      </td>
      <td className="px-3 py-2.5 text-[12px] text-[var(--color-fg-muted)]">
        {task.assignee ? (
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] flex items-center justify-center text-[10px] font-semibold shrink-0">
              {task.assignee.name[0]?.toUpperCase()}
            </span>
            <span className="truncate">{task.assignee.name}</span>
          </span>
        ) : '—'}
      </td>
      <td className="px-3 py-2.5 text-[12px] text-[var(--color-fg-muted)] w-20">
        {formatDate(task.dueAt)}
      </td>
      <td className="pr-3 py-2.5 w-12 text-right">
        {hovered && (
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] p-1 rounded transition-colors"
            aria-label="Delete task"
          >
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}

export function BacklogView() {
  const workspaceId = DEMO_WORKSPACE;
  const [slideover, setSlideover] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useTasksList(workspaceId);
  const updateTask = useUpdateTask(workspaceId);
  const deleteTask = useDeleteTask(workspaceId);
  const bulkStatus = useBulkStatus(workspaceId);
  const bulkDelete = useBulkDelete(workspaceId);

  const tasks = data?.items ?? [];
  const allSelected = tasks.length > 0 && selected.size === tasks.length;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(tasks.map((t) => t.id)));

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleUpdate = (id: string, field: string, value: string) =>
    updateTask.mutate({ id, dto: { [field]: value } });

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) deleteTask.mutate(id);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selected.size} task(s)?`)) {
      bulkDelete.mutate([...selected], { onSuccess: () => setSelected(new Set()) });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
        <div>
          <h1 className="text-[16px] font-semibold text-[var(--color-fg)]">Backlog</h1>
          <p className="text-[12px] text-[var(--color-fg-muted)] mt-0.5">
            {data?.total ?? 0} tasks
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setSlideover(true)}>
          + New task
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[var(--color-surface)] z-10">
            <tr className="border-b border-[var(--color-border)]">
              <th className="w-8 pl-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded accent-[var(--color-accent)]"
                  aria-label="Select all"
                />
              </th>
              {['Title', 'Status', 'Priority', 'Assignee', 'Due', ''].map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : tasks.length === 0 ? (
              <EmptyState onNew={() => setSlideover(true)} />
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  selected={selected.has(task.id)}
                  onToggle={() => toggleOne(task.id)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[var(--z-toast)] flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 py-2.5 shadow-[var(--shadow-overlay)]">
          <span className="text-[12px] text-[var(--color-fg-muted)]">{selected.size} selected</span>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <select
            className="text-[12px] bg-transparent text-[var(--color-fg)] border-none outline-none cursor-pointer"
            onChange={(e) => { if (e.target.value) bulkStatus.mutate({ ids: [...selected], status: e.target.value }, { onSuccess: () => setSelected(new Set()) }); }}
            defaultValue=""
          >
            <option value="" disabled>Change status…</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>Delete</Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <CreateTaskSlideover
        workspaceId={workspaceId}
        open={slideover}
        onClose={() => setSlideover(false)}
      />
    </div>
  );
}

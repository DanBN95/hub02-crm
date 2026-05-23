import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { useNotify } from '../../../context/NotificationContext';
import { useCreateTask } from '../tasks.queries';

const today = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(10_000).optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  sprintId: z.string().optional(),
  dueAt: z.string().optional().refine(
    (val) => !val || val >= today(),
    { message: 'Due date cannot be in the past' },
  ),
});

type FormValues = z.infer<typeof schema>;

interface SprintOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface Props {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
  sprints?: SprintOption[];
  /** Pre-select a sprint when opening (overridden by active sprint if not set) */
  defaultSprintId?: string;
}

export function CreateTaskSlideover({ workspaceId, open, onClose, sprints = [], defaultSprintId }: Props) {
  const titleRef = useRef<HTMLInputElement>(null);
  const create = useCreateTask(workspaceId);
  const { notify } = useNotify();

  const activeSprint = sprints.find((s) => s.isActive);
  const resolvedDefault = defaultSprintId ?? activeSprint?.id ?? '';

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'P2', status: 'BACKLOG', sprintId: resolvedDefault },
  });

  useEffect(() => {
    if (open) {
      reset({ priority: 'P2', status: 'BACKLOG', sprintId: resolvedDefault });
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: FormValues) => {
    const { sprintId, ...rest } = data;
    await create.mutateAsync({
      ...rest,
      ...(sprintId ? { sprintId } : {}),
    });
    notify('Task created successfully', 'success');
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[var(--z-overlay)] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-label="Create task"
        className="fixed right-0 top-0 bottom-0 z-[var(--z-modal)] w-[480px] bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col shadow-[var(--shadow-overlay)]"
        style={{ animation: `slideIn var(--duration-overlay) var(--ease-out)` }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-fg)]">New task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] p-1 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleSubmit(onSubmit)(); }}
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4"
        >
          {/* Title */}
          <div>
            <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="title">
              Title <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              id="title"
              {...register('title')}
              ref={(el) => { register('title').ref(el); (titleRef as React.MutableRefObject<HTMLInputElement | null>).current = el; }}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)] focus-visible:outline-[var(--color-accent)] placeholder:text-[var(--color-fg-subtle)]"
              placeholder="Task title"
            />
            {errors.title && <p className="mt-1 text-[11px] text-[var(--color-danger)]">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)] focus-visible:outline-[var(--color-accent)] placeholder:text-[var(--color-fg-subtle)] resize-none"
              placeholder="Optional description…"
            />
          </div>

          {/* Sprint */}
          <div>
            <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="sprintId">
              Sprint
            </label>
            <select
              id="sprintId"
              {...register('sprintId')}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)]"
            >
              <option value="">Backlog (no sprint)</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.isActive ? ' ★' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="priority">Priority</label>
              <select id="priority" {...register('priority')}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)]">
                <option value="P0">P0 — Critical</option>
                <option value="P1">P1 — High</option>
                <option value="P2">P2 — Medium</option>
                <option value="P3">P3 — Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="status">Status</label>
              <select id="status" {...register('status')}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)]">
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="dueAt">Due date</label>
            <input
              id="dueAt"
              type="date"
              min={today()}
              {...register('dueAt')}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)]"
            />
            {errors.dueAt && <p className="mt-1 text-[11px] text-[var(--color-danger)]">{errors.dueAt.message}</p>}
          </div>

          <div className="mt-auto flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
              Create task
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

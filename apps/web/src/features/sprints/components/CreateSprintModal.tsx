import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { useCreateSprint, useActivateSprint } from '../sprints.queries';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  goal: z.string().max(1000).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateSprintModal({ workspaceId, open, onClose }: Props) {
  const create = useCreateSprint(workspaceId);
  const activate = useActivateSprint(workspaceId);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: FormValues) => {
    const sprint = await create.mutateAsync({
      name: data.name,
      ...(data.goal ? { goal: data.goal } : {}),
      ...(data.startsAt ? { startsAt: new Date(data.startsAt).toISOString() } : {}),
      ...(data.endsAt ? { endsAt: new Date(data.endsAt).toISOString() } : {}),
    });
    await activate.mutateAsync(sprint.id);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[var(--z-overlay)] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-label="Create sprint"
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-[14px] font-semibold text-[var(--color-fg)]">New sprint</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] p-1 rounded"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 flex flex-col gap-4">
            <div>
              <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="sprint-name">
                Name <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                id="sprint-name"
                autoFocus
                {...register('name')}
                placeholder="Sprint 2"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)] focus-visible:outline-[var(--color-accent)] placeholder:text-[var(--color-fg-subtle)]"
              />
              {errors.name && <p className="mt-1 text-[11px] text-[var(--color-danger)]">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="sprint-goal">
                Goal
              </label>
              <textarea
                id="sprint-goal"
                {...register('goal')}
                rows={2}
                placeholder="What should this sprint achieve?"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)] focus-visible:outline-[var(--color-accent)] placeholder:text-[var(--color-fg-subtle)] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="sprint-start">
                  Start date
                </label>
                <input
                  id="sprint-start"
                  type="date"
                  {...register('startsAt')}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[var(--color-fg-muted)] mb-1" htmlFor="sprint-end">
                  End date
                </label>
                <input
                  id="sprint-end"
                  type="date"
                  {...register('endsAt')}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-[var(--color-fg)]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
                Create &amp; activate
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[900] bg-black/50 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden
        style={{ animation: 'fadeIn 120ms ease-out' }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal
        className="fixed z-[901] left-1/2 top-1/2 w-full max-w-[360px]
                   bg-[var(--color-surface)] border border-[var(--color-border)]
                   rounded-[var(--radius-lg)] shadow-[0_24px_64px_rgba(0,0,0,0.5)]
                   px-5 py-5 flex flex-col gap-4"
        style={{
          transform: 'translate(-50%, -50%)',
          animation: 'modalIn 150ms cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <div>
          <p className="text-[15px] font-semibold text-[var(--color-fg)] leading-snug">{title}</p>
          {message && (
            <p className="text-[13px] text-[var(--color-fg-muted)] mt-1 leading-relaxed">{message}</p>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-[var(--radius-md)] text-[13px] font-medium
                       text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]
                       bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3,var(--color-surface-2))]
                       border border-[var(--color-border)] transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-[13px] font-medium
                        text-white transition-all duration-100 active:scale-[0.97]
                        ${danger
                          ? 'bg-[var(--color-danger)] hover:opacity-90'
                          : 'bg-[var(--color-accent)] hover:opacity-90'
                        }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97) }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1) }
        }
      `}</style>
    </>,
    document.body,
  );
}

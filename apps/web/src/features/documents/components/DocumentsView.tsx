export function DocumentsView() {
  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-[20px] font-semibold text-[var(--color-fg)] tracking-tight">Documents</h1>
        <p className="text-[12px] text-[var(--color-fg-muted)] mt-0.5">
          Workspace knowledge base
        </p>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-fg-subtle)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-[16px] font-semibold text-[var(--color-fg)] mb-1.5">Documents are coming</h2>
          <p className="text-[13px] text-[var(--color-fg-muted)] leading-snug">
            Rich-text docs, project briefs, and meeting notes live here in a future sprint.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { workspacesApi } from '../../lib/workspaces';
import { useWorkspace } from '../../context/WorkspaceContext';

export function CreateWorkspacePage() {
  const { refresh } = useWorkspace();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Workspace name must be at least 2 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await workspacesApi.create(trimmed);
      // Clear the ?onboard=1 param from the URL
      const params = new URLSearchParams(window.location.search);
      params.delete('onboard');
      const newSearch = params.toString();
      window.history.replaceState(null, '', newSearch ? `?${newSearch}` : window.location.pathname);
      refresh();
    } catch {
      setError('Failed to create workspace. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <span className="text-[22px] font-bold tracking-tight text-[var(--color-fg)]">
            hub<span style={{ color: 'var(--color-accent)' }}>02</span>
          </span>
          <p className="text-[13px] text-[var(--color-fg-muted)] mt-1">Create your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <h1 className="text-[15px] font-semibold text-[var(--color-fg)] mb-1">Name your workspace</h1>
          <p className="text-[12px] text-[var(--color-fg-muted)] mb-5">
            This is where your team will collaborate. You can rename it later.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              minLength={2}
              required
              autoFocus
              className="w-full px-3 py-2 rounded-[var(--radius-md)] text-[13px]
                         bg-[var(--color-surface-2)] border border-[var(--color-border)]
                         text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)]
                         outline-none focus:border-[var(--color-accent)]
                         transition-colors duration-150"
            />

            {error && (
              <p className="text-[12px]" style={{ color: '#f87171' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || name.trim().length < 2}
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium
                         bg-[var(--color-accent)] text-white
                         hover:opacity-90 active:scale-[0.97]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-100"
            >
              {loading ? 'Creating…' : 'Create workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

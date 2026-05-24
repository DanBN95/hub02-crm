const API_BASE = import.meta.env['VITE_API_URL'] ?? '';

function getUrlParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

export function LoginPage() {
  const error = getUrlParam('error');
  const inviteToken = getUrlParam('invite_token');

  const googleHref = `${API_BASE}/auth/google`;

  return (
    <div className="h-screen w-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <span className="text-[22px] font-bold tracking-tight text-[var(--color-fg)]">
            hub<span style={{ color: 'var(--color-accent)' }}>02</span>
          </span>
          <p className="text-[13px] text-[var(--color-fg-muted)] mt-1">Your team's workspace</p>
        </div>

        {/* Invite banner */}
        {inviteToken && !error && (
          <div
            className="mb-4 px-4 py-3 rounded-[var(--radius-md)] text-[13px]"
            style={{ background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.3)', color: 'var(--color-accent)' }}
          >
            🎉 You've been invited! Sign in with Google below to join the workspace.
          </div>
        )}

        {/* Error banner */}
        {error === 'not_invited' && (
          <div
            className="mb-4 px-4 py-3 rounded-[var(--radius-md)] text-[13px]"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            Your Google account hasn't been invited to this workspace. Ask an admin to send you an invitation.
          </div>
        )}

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <h1 className="text-[15px] font-semibold text-[var(--color-fg)] mb-1">Sign in</h1>
          <p className="text-[12px] text-[var(--color-fg-muted)] mb-5">
            Continue with your Google account to access your workspace.
          </p>

          <a
            href={googleHref}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5
                       bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)]
                       border border-[var(--color-border)] hover:border-[var(--color-border-strong,var(--color-border))]
                       rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--color-fg)]
                       transition-colors duration-150 outline-none
                       focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            {/* Google icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.31a3.68 3.68 0 01-1.6 2.42v2h2.59c1.52-1.4 2.39-3.46 2.39-5.88z" fill="#4285F4"/>
              <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2c-.71.48-1.63.76-2.71.76-2.08 0-3.85-1.41-4.48-3.3H.85v2.07A8 8 0 008 16z" fill="#34A853"/>
              <path d="M3.52 9.52A4.8 4.8 0 013.27 8c0-.53.09-1.04.25-1.52V4.41H.85A8 8 0 000 8c0 1.29.31 2.51.85 3.59l2.67-2.07z" fill="#FBBC05"/>
              <path d="M8 3.18c1.17 0 2.22.4 3.05 1.2l2.28-2.28A8 8 0 00.85 4.41L3.52 6.48C4.15 4.59 5.92 3.18 8 3.18z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>
        </div>

        <p className="text-[11px] text-[var(--color-fg-subtle)] text-center mt-4">
          Only team members with an invitation can access this workspace.
        </p>
      </div>
    </div>
  );
}

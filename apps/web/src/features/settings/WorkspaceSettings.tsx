import { useEffect, useRef, useState } from 'react';
import { invitationsApi, type InvitationSummary } from '../../lib/invitations';

interface Props {
  workspaceId: string;
  workspaceName: string;
}

function relativeExpiry(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const h = Math.floor(ms / 3_600_000);
  if (h <= 0) return 'Expired';
  if (h < 24) return `Expires in ${h}h`;
  return `Expires in ${Math.floor(h / 24)}d`;
}

export function WorkspaceSettings({ workspaceId, workspaceName }: Props) {
  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState<InvitationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    invitationsApi
      .list(workspaceId)
      .then(setInvites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setSending(true);
    try {
      const invite = await invitationsApi.create(workspaceId, email.trim());
      setInvites((prev) => {
        const exists = prev.some((i) => i.id === invite.id);
        return exists ? prev : [invite, ...prev];
      });
      setEmail('');
      // Auto-copy invite URL
      await copyUrl(invite.inviteUrl);
    } catch {
      setError('Failed to create invitation. Try again.');
    } finally {
      setSending(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard not available — silently ignore
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-[20px] font-semibold text-[var(--color-fg)] tracking-tight">Settings</h1>
        <p className="text-[12px] text-[var(--color-fg-muted)] mt-0.5">{workspaceName}</p>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6 max-w-[640px]">
        {/* Invite section */}
        <section>
          <h2 className="text-[13px] font-semibold text-[var(--color-fg)] mb-1">Invite members</h2>
          <p className="text-[12px] text-[var(--color-fg-muted)] mb-4">
            Send a 24-hour invite link. The link is copied to your clipboard automatically.
          </p>

          <form onSubmit={sendInvite} className="flex gap-2">
            <input
              ref={inputRef}
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-[13px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="px-4 py-2 text-[13px] font-medium rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              {sending ? 'Sending…' : 'Send invite'}
            </button>
          </form>

          {error && (
            <p className="text-[12px] text-[var(--color-danger)] mt-2">{error}</p>
          )}
        </section>

        {/* Pending invites */}
        <section className="mt-8">
          <h2 className="text-[13px] font-semibold text-[var(--color-fg)] mb-3">
            Pending invitations
            {invites.length > 0 && (
              <span className="ml-2 text-[11px] font-normal text-[var(--color-fg-muted)]">
                {invites.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 rounded-[var(--radius-md)] bg-[var(--color-surface)] animate-pulse" />
              ))}
            </div>
          ) : invites.length === 0 ? (
            <p className="text-[12px] text-[var(--color-fg-subtle)]">No pending invitations.</p>
          ) : (
            <ul className="space-y-1">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[var(--color-fg)] truncate">{invite.email}</p>
                    <p className="text-[11px] text-[var(--color-fg-subtle)]">
                      {relativeExpiry(invite.expiresAt)} · {invite.role}
                    </p>
                  </div>
                  <button
                    onClick={() => copyUrl(invite.inviteUrl)}
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong,var(--color-border))] transition-colors"
                  >
                    {copied === invite.inviteUrl ? (
                      <>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V5.5L11.5 2H7a2 2 0 0 0-2 2v1H4V4a2 2 0 0 1 2-2h4v2.5a1 1 0 0 0 1 1H13V9a1 1 0 0 1-1 1h-1V7a2 2 0 0 0-2-2H4zm0 4h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>
                        </svg>
                        Copy link
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

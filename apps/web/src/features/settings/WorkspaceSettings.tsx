import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    invitationsApi.list(workspaceId).then(setInvites).catch(() => {}).finally(() => setLoading(false));
  }, [workspaceId]);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setSending(true);
    try {
      const invite = await invitationsApi.create(workspaceId, email.trim());
      setInvites((prev) => prev.some((i) => i.id === invite.id) ? prev : [invite, ...prev]);
      setEmail('');
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
    } catch { /* clipboard not available */ }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3, py: 2.5,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {workspaceName}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3, maxWidth: 640 }}>

        {/* Invite section */}
        <Typography variant="h3" sx={{ mb: 0.5 }}>Invite members</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
          Generates a 24-hour invite link. Copied to clipboard automatically.
        </Typography>

        <Box component="form" onSubmit={sendInvite} sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
            disabled={sending || !email.trim()}
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {sending ? 'Sending…' : 'Send invite'}
          </Button>
        </Box>

        {error && (
          <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>{error}</Typography>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Pending invites */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h3">Pending invitations</Typography>
          {invites.length > 0 && (
            <Chip
              label={invites.length}
              size="small"
              sx={{ height: 18, fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.08)' }}
            />
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1.5 }} />)}
          </Box>
        ) : invites.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            No pending invitations.
          </Typography>
        ) : (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {invites.map((invite) => (
              <ListItem
                key={invite.id}
                sx={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 1.5,
                  background: 'rgba(255,255,255,0.02)',
                  px: 2,
                  py: 1.25,
                  '&:hover': { background: 'rgba(255,255,255,0.04)' },
                  transition: 'background 120ms',
                }}
                secondaryAction={
                  <Tooltip title={copied === invite.inviteUrl ? 'Copied!' : 'Copy invite link'} placement="left">
                    <IconButton
                      size="small"
                      onClick={() => copyUrl(invite.inviteUrl)}
                      sx={{
                        color: copied === invite.inviteUrl ? 'success.main' : 'text.secondary',
                        '&:hover': { color: 'text.primary' },
                        transition: 'color 150ms',
                      }}
                    >
                      {copied === invite.inviteUrl
                        ? <DoneIcon sx={{ fontSize: 16 }} />
                        : <ContentCopyIcon sx={{ fontSize: 16 }} />
                      }
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={invite.email}
                  secondary={`${relativeExpiry(invite.expiresAt)} · ${invite.role}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

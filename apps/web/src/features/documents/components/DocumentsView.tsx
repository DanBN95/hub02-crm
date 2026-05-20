import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { useNotify } from '../../../context/NotificationContext';
import { documentsApi } from '../documents.api';
import {
  useCreateFolder,
  useDeleteDocument,
  useDocumentsList,
  useFoldersList,
  useUploadDocument,
} from '../documents.queries';

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function mimeToEmoji(mime: string): string {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime === 'application/pdf') return '📄';
  if (mime.includes('word') || mime.includes('document')) return '📝';
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return '📊';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return '📑';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return '🗜️';
  if (mime.startsWith('text/')) return '📃';
  return '📎';
}

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

// ── New Folder Dialog ────────────────────────────────────────────────────────

function NewFolderDialog({
  open,
  onClose,
  onCreate,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 340 } } }}
    >
      <DialogTitle sx={{ fontSize: 15, fontWeight: 600 }}>New folder</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') onClose();
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="text" onClick={onClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!name.trim() || isPending}
        >
          {isPending ? <CircularProgress size={14} color="inherit" /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Folder nav item ──────────────────────────────────────────────────────────

function FolderNavItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        px: 1.25,
        py: 0.875,
        borderRadius: 1,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        background: active ? 'rgba(124,127,245,0.12)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'text.secondary',
        fontFamily: 'inherit',
        transition: 'background 80ms, color 80ms',
        '&:hover': {
          background: active ? 'rgba(124,127,245,0.16)' : 'rgba(255,255,255,0.05)',
          color: active ? 'var(--color-accent)' : 'text.primary',
        },
      }}
    >
      {active ? (
        <FolderOpenOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
      ) : (
        <FolderOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
      )}
      <Typography sx={{ fontSize: 13, fontWeight: active ? 500 : 400, flex: 1, color: 'inherit' }}>
        {label}
      </Typography>
      {count !== undefined && count > 0 && (
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{count}</Typography>
      )}
    </Box>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  workspaceId: string;
}

export function DocumentsView({ workspaceId }: Props) {
  const { notify, confirm } = useNotify();
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>(undefined);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: folders = [], isLoading: foldersLoading } = useFoldersList(workspaceId);
  const { data: documents = [], isLoading: docsLoading } = useDocumentsList(workspaceId, activeFolderId);
  const createFolder = useCreateFolder(workspaceId);
  const uploadDoc = useUploadDocument(workspaceId, activeFolderId);
  const deleteDoc = useDeleteDocument(workspaceId);

  const handleCreateFolder = (name: string) => {
    createFolder.mutate(name, {
      onSuccess: () => {
        setFolderDialogOpen(false);
        notify('Folder created', 'success');
      },
      onError: () => notify('A folder with that name already exists', 'error'),
    });
  };

  const handleFiles = (files: File[]) => {
    if (!files.length) return;
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        notify(`${file.name} exceeds 10 MB limit`, 'error');
        continue;
      }
      uploadDoc.mutate(file, {
        onSuccess: () => notify(`${file.name} uploaded`, 'success'),
        onError: () => notify(`Failed to upload ${file.name}`, 'error'),
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm(`Delete "${name}"? This cannot be undone.`, 'Delete file');
    if (!ok) return;
    deleteDoc.mutate(id, {
      onSuccess: () => notify(`${name} deleted`, 'success'),
      onError: () => notify('Failed to delete file', 'error'),
    });
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      await documentsApi.download(id, name);
    } catch {
      notify('Failed to download file', 'error');
    }
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const activeFolderLabel = activeFolderId ? (activeFolder?.name ?? '…') : 'All files';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2.5,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            Documents
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.25 }}>
            Workspace knowledge base
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="New folder">
          <IconButton
            size="small"
            onClick={() => setFolderDialogOpen(true)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', background: 'rgba(255,255,255,0.06)' } }}
          >
            <CreateNewFolderOutlinedIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadDoc.isPending}
          sx={{ height: 32, fontSize: 13 }}
        >
          Upload
        </Button>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <Box
          sx={{
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid var(--color-border)',
            px: 1,
            py: 1.5,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
          }}
        >
          <FolderNavItem
            label="All files"
            count={folders.reduce((s, f) => s + f._count.documents, 0)}
            active={activeFolderId === undefined}
            onClick={() => setActiveFolderId(undefined)}
          />

          {!foldersLoading && folders.length > 0 && (
            <Box sx={{ mt: 1, mb: 0.5, px: 1.25 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Folders
              </Typography>
            </Box>
          )}

          {folders.map((f) => (
            <FolderNavItem
              key={f.id}
              label={f.name}
              count={f._count.documents}
              active={activeFolderId === f.id}
              onClick={() => setActiveFolderId(f.id)}
            />
          ))}
        </Box>

        {/* File list */}
        <Box
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {/* Drop overlay */}
          {dragging && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'oklch(0% 0 0 / 0.55)',
                backdropFilter: 'blur(4px)',
                border: '2px dashed var(--color-accent)',
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <UploadFileOutlinedIcon sx={{ fontSize: 40, color: 'var(--color-accent)', mb: 1 }} />
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent)' }}>
                  Drop files to upload
                </Typography>
              </Box>
            </Box>
          )}

          {/* Section label */}
          <Box sx={{ flexShrink: 0, px: 3, py: 1.5, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>
              {activeFolderLabel}
            </Typography>
            {documents.length > 0 && (
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                · {documents.length} file{documents.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          {/* Table */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 1 }}>
            {docsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
                <CircularProgress size={24} sx={{ color: 'text.disabled' }} />
              </Box>
            )}

            {!docsLoading && documents.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 200,
                  gap: 1.5,
                  color: 'text.disabled',
                }}
              >
                <UploadFileOutlinedIcon sx={{ fontSize: 36, opacity: 0.5 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>No files yet</Typography>
                <Typography sx={{ fontSize: 12, textAlign: 'center', maxWidth: 260 }}>
                  Upload a file or drag and drop here
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mt: 0.5, fontSize: 12, color: 'var(--color-accent)' }}
                >
                  Upload file
                </Button>
              </Box>
            )}

            {!docsLoading && documents.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Table header */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 120px 80px',
                    px: 1.5,
                    py: 1,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--color-bg)',
                    zIndex: 1,
                  }}
                >
                  {['Name', 'Size', 'Uploaded by', ''].map((h) => (
                    <Typography key={h} sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {documents.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 120px 80px',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1.25,
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: 1,
                      transition: 'background 80ms',
                      '&:hover': { background: 'rgba(255,255,255,0.04)' },
                      '&:hover .doc-actions': { opacity: 1 },
                    }}
                  >
                    {/* Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{mimeToEmoji(doc.mimeType)}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.name}
                      </Typography>
                    </Box>

                    {/* Size */}
                    <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{formatBytes(doc.size)}</Typography>

                    {/* Uploader + time */}
                    <Box>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{doc.uploadedBy.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{relativeTime(doc.createdAt)}</Typography>
                    </Box>

                    {/* Actions */}
                    <Box
                      className="doc-actions"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0, transition: 'opacity 100ms', justifyContent: 'flex-end' }}
                    >
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc.id, doc.name)}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
                        >
                          <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(doc.id, doc.name)}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />

      <NewFolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        onCreate={handleCreateFolder}
        isPending={createFolder.isPending}
      />
    </Box>
  );
}

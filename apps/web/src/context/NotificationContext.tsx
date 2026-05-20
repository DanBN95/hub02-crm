import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  severity: Severity;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

interface NotificationContextType {
  notify: (message: string, severity?: Severity) => void;
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

let toastId = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false, title: '', message: '', resolve: null,
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const notify = useCallback((message: string, severity: Severity = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, severity }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const confirm = useCallback((message: string, title = 'Confirm'): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirmState({ open: true, title, message, resolve });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setConfirmState((s) => ({ ...s, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}

      {/* Toasts */}
      {toasts.map((toast, i) => (
        <Snackbar
          key={toast.id}
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ bottom: `${16 + i * 72}px !important` }}
        >
          <Alert
            severity={toast.severity}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            sx={{
              minWidth: 280,
              boxShadow: '0 4px 24px oklch(0% 0 0 / 0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}

      {/* Confirm dialog */}
      <Dialog
        open={confirmState.open}
        onClose={() => handleConfirmClose(false)}
        slotProps={{ paper: { sx: { width: 380 } } }}
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 600 }}>{confirmState.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {confirmState.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="text"
            onClick={() => handleConfirmClose(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleConfirmClose(true)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used inside NotificationProvider');
  return ctx;
}

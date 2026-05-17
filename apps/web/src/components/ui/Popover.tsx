import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface PopoverState {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const Ctx = createContext<PopoverState | null>(null);
const usePopoverCtx = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Popover components must be used within <Popover>');
  return ctx;
};

interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      setUncontrolledOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        contentRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open, setOpen]);

  return <Ctx.Provider value={{ open, setOpen, triggerRef, contentRef }}>{children}</Ctx.Provider>;
}

interface TriggerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
}

export function PopoverTrigger({ children, className, style }: TriggerProps) {
  const { open, setOpen, triggerRef } = usePopoverCtx();
  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      style={style}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
    >
      {children}
    </button>
  );
}

interface ContentProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

export function PopoverContent({ children, className = '', align = 'left' }: ContentProps) {
  const { open, contentRef, triggerRef } = usePopoverCtx();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    setPos({
      top: rect.bottom + scrollY + 4,
      left: align === 'left' ? rect.left + scrollX : rect.right + scrollX - 200,
    });
  }, [open, align, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{ top: pos.top, left: pos.left }}
      className={`absolute z-[9999] ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
}

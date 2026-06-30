/**
 * Modal.tsx — accessible light dialog shell (portal + backdrop + ESC + scroll-lock).
 * White card with a circular close button, to match the brand's booking/call popups.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './Icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the heading inside the dialog, for aria-labelledby. */
  labelledBy?: string;
  /** Tailwind max-width utility for the panel. */
  size?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, labelledBy, size = 'max-w-lg', children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div
        className="animate-fade-in fixed inset-0 bg-brand-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`animate-fade-up relative z-10 my-auto w-full ${size} rounded-2xl bg-white text-brand-black shadow-2xl outline-none`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black/45 shadow-sm backdrop-blur transition hover:bg-black/5 hover:text-black"
        >
          <CloseIcon className="text-lg" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

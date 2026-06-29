/**
 * AdminToast — lightweight success/error notifications for admin actions.
 *
 * Replaces the scattered, inconsistent inline "saved" text. Wrap the admin shell in
 * <AdminToastProvider> and call useAdminToast().success/error from any tab. A save that
 * throws should surface toast.error so failures are never silent.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CheckIcon, CloseIcon } from '@/components/ui/Icons';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastCtx = createContext<ToastApi | undefined>(undefined);

// Module-level monotonic id (no Date.now/random needed; just a unique key per toast).
let nextToastId = 0;

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, type: 'success' | 'error') => {
    const id = nextToastId++;
    setToasts((list) => [...list, { id, message, type }]);
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3500);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push(m, 'success'), error: (m) => push(m, 'error') }),
    [push],
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((tst) => (
          <div
            key={tst.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg',
              tst.type === 'success'
                ? 'border-green-500/40 bg-green-500/15 text-green-300'
                : 'border-brand-red/40 bg-brand-red/15 text-brand-red',
            )}
          >
            {tst.type === 'success' ? <CheckIcon className="text-base" /> : <CloseIcon className="text-base" />}
            {tst.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useAdminToast must be used within <AdminToastProvider>');
  return ctx;
}

/**
 * SchedulingProvider — single source of truth for the booking/call popups so every CTA
 * (hero buttons, header "Talk to an Agent", final CTA) opens the same dialogs. Mounts the
 * two dialogs once; triggers call openSchedule()/openCall() via the useScheduling() hook.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ScheduleDialog, CallDialog } from './SpecialistDialogs';

interface SchedulingApi {
  openSchedule: () => void;
  openCall: () => void;
  close: () => void;
}

const SchedulingContext = createContext<SchedulingApi | undefined>(undefined);

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<null | 'schedule' | 'call'>(null);

  const api = useMemo<SchedulingApi>(
    () => ({
      openSchedule: () => setDialog('schedule'),
      openCall: () => setDialog('call'),
      close: () => setDialog(null),
    }),
    [],
  );

  return (
    <SchedulingContext.Provider value={api}>
      {children}
      <ScheduleDialog
        open={dialog === 'schedule'}
        onClose={() => setDialog(null)}
        onCall={() => setDialog('call')}
      />
      <CallDialog
        open={dialog === 'call'}
        onClose={() => setDialog(null)}
        onSchedule={() => setDialog('schedule')}
      />
    </SchedulingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useScheduling(): SchedulingApi {
  const ctx = useContext(SchedulingContext);
  if (!ctx) throw new Error('useScheduling must be used within <SchedulingProvider>');
  return ctx;
}

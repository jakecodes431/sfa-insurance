/**
 * SpecialistDialogs — the two hero popups.
 *  • ScheduleDialog: "Speak With a Licensed Medicare Specialist" → self-hosted Cal.com
 *    booking embed (calendar.serviceflowpro.co). Falls back to a call-to-book panel until
 *    the SFA event-type link is set in business.config (scheduling.calUrl).
 *  • CallDialog: the click-to-call popup (modeled on the client's current Calendly popup).
 * Each can hand off to the other so a visitor is never stuck on one path.
 *
 * Theme note: brand tokens are semantic slots (see index.css) — `brand-white` is the navy
 * ink, `brand-chrome` muted text, `brand-steel` hairlines, `brand-charcoal` white surface.
 */
import { Modal } from '@/components/ui/Modal';
import { businessConfig } from '@/config/business.config';
import {
  PhoneIcon,
  CalendarIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  ShieldIcon,
} from '@/components/ui/Icons';

/** Trust strip shared by both dialogs (no emoji — inline icons). */
function TrustStrip() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs font-medium text-brand-chrome">
      <span className="inline-flex items-center gap-1.5">
        <CheckIcon className="text-sm text-brand-red" />
        Licensed &amp; Certified Agents
      </span>
      <span aria-hidden className="hidden text-brand-steel sm:inline">
        |
      </span>
      <span className="inline-flex items-center gap-1.5">
        <StarIcon filled className="text-sm text-brand-red" />
        Rated 4.9 / 5 by Medicare Beneficiaries
      </span>
      <span aria-hidden className="hidden text-brand-steel sm:inline">
        |
      </span>
      <span className="inline-flex items-center gap-1.5">
        <ShieldIcon className="text-sm text-brand-red" />
        Partnered with top carriers (Aetna, Humana, UHC)
      </span>
    </div>
  );
}

/** Required CMS / TPMO disclaimer. */
function Disclaimer() {
  return (
    <p className="mt-4 text-center text-[0.7rem] leading-relaxed text-brand-chrome/75">
      We do not offer every plan available in your area. Information provided is limited to the
      plans we offer. Not connected with or endorsed by the U.S. Government or the federal Medicare
      program.
    </p>
  );
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

/** Booking popup — the landing page's main CTA. */
export function ScheduleDialog({ open, onClose, onCall }: DialogProps & { onCall: () => void }) {
  const { calUrl } = businessConfig.scheduling;

  return (
    <Modal open={open} onClose={onClose} labelledBy="schedule-title" size="max-w-3xl">
      {/* Capped to the dynamic viewport so the popup always fits on any screen. */}
      <div className="max-h-[calc(100dvh-3rem)] overflow-y-auto px-4 pb-4 pt-6 sm:px-7 sm:pb-6">
        <h2
          id="schedule-title"
          className="pr-8 font-display text-xl font-bold leading-tight text-brand-white sm:text-[1.75rem]"
        >
          Speak With a Licensed Medicare Specialist
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-chrome">
          Pick a time that works for you and a licensed agent will call to review your plan. No
          cost, no pressure.
        </p>

        <div className="mt-3">
          {calUrl ? (
            <iframe
              src={calUrl}
              title="Schedule a call with a licensed Medicare specialist"
              loading="lazy"
              className="h-[clamp(260px,calc(100dvh-23rem),540px)] w-full rounded-xl border border-brand-steel"
            />
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-steel bg-brand-black/50 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                <CalendarIcon className="text-2xl" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-brand-white">
                Online scheduling is on its way
              </p>
              <p className="mt-1 max-w-sm text-sm text-brand-chrome">
                Our booking calendar connects right here. For now, call to lock in a time with a
                licensed specialist.
              </p>
              <button type="button" onClick={onCall} className="btn-primary mt-5">
                <PhoneIcon className="text-base" />
                Call {businessConfig.phone}
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {/* Reciprocal hand-off: prefer a call instead of picking a time. */}
          {calUrl && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={onCall}
                className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-brand-white transition-colors hover:text-brand-red"
              >
                <PhoneIcon className="text-base" />
                Prefer to talk now? Call {businessConfig.phone}
              </button>
            </div>
          )}

          <TrustStrip />
          <Disclaimer />
        </div>
      </div>
    </Modal>
  );
}

/** Click-to-call popup — the landing page's secondary CTA. */
export function CallDialog({ open, onClose, onSchedule }: DialogProps & { onSchedule: () => void }) {
  const tel = `tel:${businessConfig.phoneE164}`;

  return (
    <Modal open={open} onClose={onClose} labelledBy="call-title">
      <div className="px-6 pb-6 pt-9 text-center sm:px-9">
        <h2
          id="call-title"
          className="font-display text-3xl font-bold leading-[1.05] text-brand-white sm:text-4xl"
        >
          Talk With a <span className="text-brand-red">Licensed Medicare Specialist</span> Now
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-chrome sm:text-base">
          Get clear answers without the confusion. In one call we will review your doctors,
          prescriptions, and budget, compare plans side by side, and help you enroll when you are
          ready.
        </p>

        <a
          href={tel}
          className="mt-7 flex w-full flex-col items-center rounded-2xl bg-brand-red px-6 py-4 text-white shadow-glow-sm transition hover:bg-brand-red-dark"
        >
          <span className="inline-flex items-center gap-2.5 text-xl font-bold">
            <PhoneIcon className="text-xl" />
            Call {businessConfig.phone}
          </span>
          <span className="mt-0.5 text-sm text-white/80">
            Agents available {businessConfig.scheduling.hoursLabel}
          </span>
        </a>

        <button
          type="button"
          onClick={onSchedule}
          className="group mt-5 inline-flex items-center gap-2 font-display text-base font-semibold text-brand-white transition-colors hover:text-brand-red"
        >
          Book a meeting
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>

        <div className="mt-6 border-t border-brand-steel pt-5">
          <TrustStrip />
          <Disclaimer />
        </div>
      </div>
    </Modal>
  );
}

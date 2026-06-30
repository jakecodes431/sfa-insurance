/**
 * SpecialistDialogs — the two hero popups.
 *  • ScheduleDialog: "Speak With a Licensed Medicare Specialist" → self-hosted Cal.com
 *    booking embed (calendar.serviceflowpro.co). Falls back to a call-to-book panel until
 *    the SFA event-type link is set in business.config (scheduling.calUrl).
 *  • CallDialog: the click-to-call popup (modeled on the client's current Calendly popup).
 * Each can hand off to the other so a visitor is never stuck on one path.
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
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs font-medium text-black/60">
      <span className="inline-flex items-center gap-1.5">
        <CheckIcon className="text-sm text-brand-red" />
        Licensed &amp; Certified Agents
      </span>
      <span aria-hidden className="hidden text-black/15 sm:inline">
        |
      </span>
      <span className="inline-flex items-center gap-1.5">
        <StarIcon filled className="text-sm text-brand-red" />
        Rated 4.9 / 5 by Medicare Beneficiaries
      </span>
      <span aria-hidden className="hidden text-black/15 sm:inline">
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
    <p className="mt-4 text-center text-[0.7rem] leading-relaxed text-black/45">
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
    <Modal open={open} onClose={onClose} labelledBy="schedule-title" size="max-w-2xl">
      <div className="px-6 pb-6 pt-8 sm:px-8">
        <h2
          id="schedule-title"
          className="pr-8 font-display text-2xl font-bold leading-tight text-brand-black sm:text-[1.75rem]"
        >
          Speak With a Licensed Medicare Specialist
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-black/60 sm:text-base">
          Pick a time that works for you and a licensed agent will call to review your plan. No
          cost, no pressure.
        </p>

        <div className="mt-5">
          {calUrl ? (
            <iframe
              src={calUrl}
              title="Schedule a call with a licensed Medicare specialist"
              loading="lazy"
              className="h-[58vh] min-h-[420px] w-full rounded-xl border border-black/10"
            />
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-black/15 bg-black/[0.02] px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                <CalendarIcon className="text-2xl" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-brand-black">
                Online scheduling is on its way
              </p>
              <p className="mt-1 max-w-sm text-sm text-black/55">
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

        <TrustStrip />
        <Disclaimer />
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
          className="font-display text-3xl font-bold leading-[1.05] text-brand-black sm:text-4xl"
        >
          Talk With a <span className="text-brand-red">Licensed Medicare Specialist</span> Now
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-black/60 sm:text-base">
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
          className="group mt-5 inline-flex items-center gap-2 font-display text-base font-semibold text-brand-black transition-colors hover:text-brand-red"
        >
          Book a meeting
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>

        <div className="mt-6 border-t border-black/5 pt-5">
          <TrustStrip />
          <Disclaimer />
        </div>
      </div>
    </Modal>
  );
}

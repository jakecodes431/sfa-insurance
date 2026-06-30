/**
 * AutomationsManager — admin view of the automated email (Resend) + SMS (Twilio) follow-up
 * sequences and a recent-activity log. Demo: toggles are local and the log is sample data;
 * the live build wires sends to the client's Resend + Twilio via an Edge Function off
 * sfp_ins_leads. See Notes/.../EMAIL-SMS-AUTOMATION (planned).
 */
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { formatDateTime } from '@/lib/format';
import { automations as seedAutomations, automationLog, type Channel } from '@/config/automations.config';
import { MailIcon, MessageIcon } from '@/components/ui/Icons';

function ChannelBadge({ channel }: { channel: Channel }) {
  const isEmail = channel === 'email';
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-steel bg-brand-black/30 px-2 py-0.5 text-[0.7rem] font-medium text-brand-chrome">
      {isEmail ? <MailIcon className="text-xs text-brand-red" /> : <MessageIcon className="text-xs text-brand-red" />}
      {isEmail ? 'Email' : 'SMS'}
    </span>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-red' : 'bg-brand-steel'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-[1.4rem]' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export function AutomationsManager() {
  const { locale } = useLocale();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(seedAutomations.map((a) => [a.id, a.enabled])),
  );

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Intro / providers */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-brand-white">Automated follow-up</h3>
          <p className="mt-1 max-w-xl text-sm text-brand-chrome">
            Emails and texts that send on their own when a lead comes in or moves through the
            pipeline. {activeCount} of {seedAutomations.length} sequences active.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-steel px-3 py-1 text-xs text-brand-chrome">
            <MailIcon className="text-sm text-brand-red" /> Email via Resend
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-steel px-3 py-1 text-xs text-brand-chrome">
            <MessageIcon className="text-sm text-brand-red" /> SMS via Twilio
          </span>
        </div>
      </div>

      {/* Sequences */}
      <div className="grid gap-4 lg:grid-cols-2">
        {seedAutomations.map((a) => {
          const on = enabled[a.id];
          return (
            <section key={a.id} className={`card transition-opacity ${on ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display text-base font-semibold text-brand-white">{a.name}</h4>
                    {[...new Set(a.steps.map((s) => s.channel))].map((c) => (
                      <ChannelBadge key={c} channel={c} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-brand-chrome">
                    {a.trigger} · <span className="text-brand-white">{a.timing}</span>
                  </p>
                </div>
                <Toggle on={on} onClick={() => setEnabled((e) => ({ ...e, [a.id]: !e[a.id] }))} />
              </div>

              <ul className="mt-4 space-y-2.5">
                {a.steps.map((s, i) => (
                  <li key={i} className="rounded-lg border border-brand-steel/60 bg-brand-black/20 p-3">
                    <div className="flex items-center gap-2">
                      <ChannelBadge channel={s.channel} />
                      {s.subject && <span className="truncate text-xs font-medium text-brand-white">{s.subject}</span>}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-chrome">{s.preview}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Recent activity */}
      <section className="card">
        <h3 className="font-display text-lg text-brand-white">Recent activity</h3>
        <ul className="mt-4 divide-y divide-brand-steel/60">
          {automationLog.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                  {e.channel === 'email' ? <MailIcon className="text-sm" /> : <MessageIcon className="text-sm" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-white">{e.to}</p>
                  <p className="truncate text-xs text-brand-chrome">{e.automation}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded-full border border-brand-steel px-2 py-0.5 text-[0.7rem] capitalize text-brand-chrome">
                  {e.status}
                </span>
                <p className="mt-1 text-[0.7rem] text-brand-chrome/70">{formatDateTime(e.at, locale)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

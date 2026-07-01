/**
 * Enroll — the self-service funnel for dental/vision + life. Branded SFA page → short
 * capture form (the lead is saved to SFA's own admin, tagged self-enroll:<product>, so the
 * agency owns the data + can match the conversion) → hand off to the carrier enrollment
 * link where the consumer picks a plan and pays on the carrier's site.
 */
import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { CheckIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { createLead } from '@/lib/data';
import { asset } from '@/lib/asset';
import { enrollProducts } from '@/config/carriers.config';

export default function Enroll() {
  const { product = '' } = useParams();
  const p = enrollProducts[product];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!p) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !consent) return;
    setBusy(true);
    try {
      await createLead({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        zip: zip.trim() || null,
        product_line: p!.productLine,
        best_time: 'anytime',
        consent_contact: consent,
        source: `self-enroll:${p!.slug}`,
        status: 'new',
      });
      setSubmitted(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-content py-14 sm:py-20">
      <Seo title={`${p.eyebrow} — SFA Insurance Group`} path={`/enroll/${p.slug}`} />

      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        {/* Pitch */}
        <div>
          <span className="eyebrow">{p.eyebrow}</span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-brand-white sm:text-4xl">
            {p.headline}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-brand-chrome sm:text-lg">{p.sub}</p>
          <ul className="mt-6 space-y-3">
            {p.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-brand-white">
                <CheckIcon className="mt-0.5 shrink-0 text-lg text-brand-red" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Capture → handoff */}
        <div className="panel-ring !p-6">
          {!submitted ? (
            <>
              <h2 className="text-xl font-bold text-brand-white">Get started</h2>
              <p className="mt-1 text-sm text-brand-chrome">
                A few quick details and we will take you to enroll.
              </p>
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="input-field" />
                  <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Zip" className="input-field" />
                </div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="input-field" />
                <label className="flex items-start gap-2 text-xs leading-relaxed text-brand-chrome">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
                  I agree to be contacted by SFA Insurance Group about my coverage options. Message
                  and data rates may apply.
                </label>
                <button type="submit" disabled={busy || !name.trim() || !consent} className="btn-primary w-full disabled:opacity-40">
                  Continue
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-brand-white">You are all set, {name.split(' ')[0]}.</h2>
              <p className="mt-1 text-sm text-brand-chrome">
                Choose a carrier below to see plans in your area and enroll. Your info is saved so a
                licensed agent can help if you need it.
              </p>
              <div className="mt-5 space-y-3">
                {p.carriers.map((c) => (
                  <a
                    key={c.name}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center justify-between gap-3 rounded-xl border border-brand-steel bg-brand-charcoal/60 p-4 transition hover:border-brand-red hover:shadow-glow-sm"
                  >
                    <span className="flex items-center gap-3">
                      {c.logo && <img src={asset(c.logo)} alt="" className="h-6 w-auto max-w-[6rem] object-contain" />}
                      <span className="font-medium text-brand-white">Enroll with {c.name}</span>
                    </span>
                    <ArrowRightIcon className="text-brand-red transition-transform group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compliance */}
      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-brand-chrome/70">
        SFA Insurance Group is an independent, licensed agency. Enrollment and payment are completed
        on the carrier's website. We are not connected with or endorsed by any government program.
      </p>
    </section>
  );
}

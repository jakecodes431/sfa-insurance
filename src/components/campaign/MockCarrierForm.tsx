/**
 * MockCarrierForm — a stand-in for the carrier's embedded enrollment page, used in the demo
 * so every /c/:slug campaign shows a clean in-site window regardless of whether the real
 * carrier allows framing. Swapped for the carrier's real agent link once provided.
 */
import { useState } from 'react';
import { CheckIcon } from '@/components/ui/Icons';
import type { EnrollProduct } from '@/config/carriers.config';

interface Plan {
  name: string;
  price: string;
  perks: string;
}

const PLANS: Record<string, Plan[]> = {
  'dental-vision': [
    { name: 'Essential Dental', price: '$18/mo', perks: 'Cleanings, exams, x-rays' },
    { name: 'Complete Dental + Vision', price: '$34/mo', perks: 'Adds fillings, glasses, exams' },
    { name: 'Premier', price: '$49/mo', perks: 'Major work, higher annual max' },
  ],
  'life-final-expense': [
    { name: '$10,000 Final Expense', price: '$28/mo', perks: 'Fixed premium, no exam' },
    { name: '$20,000 Whole Life', price: '$52/mo', perks: 'Builds cash value' },
    { name: '$30,000 Whole Life', price: '$74/mo', perks: 'Higher coverage' },
  ],
};

export function MockCarrierForm({ carrier, product }: { carrier: string; product?: EnrollProduct }) {
  const plans = PLANS[product?.productLine ?? ''] ?? PLANS['dental-vision'];
  const [plan, setPlan] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center bg-white px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C5BD6]/10 text-[#1C5BD6]">
          <CheckIcon className="text-2xl" />
        </span>
        <p className="mt-4 text-lg font-bold text-[#0E2747]">Application started with {carrier}</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Demo placeholder. In the live site this is {carrier}'s secure enrollment and payment page,
          embedded here. Your details are already saved to SFA.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[420px] bg-white px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <p className="font-bold text-[#0E2747]">{carrier} Enrollment</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] text-slate-500">Demo form</span>
      </div>

      <p className="mt-4 text-sm text-slate-500">Choose a plan to continue.</p>
      <div className="mt-3 space-y-2.5">
        {plans.map((p, i) => {
          const active = plan === i;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setPlan(i)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${
                active ? 'border-[#1C5BD6] bg-[#1C5BD6]/5' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>
                <span className="block font-semibold text-[#0E2747]">{p.name}</span>
                <span className="block text-xs text-slate-500">{p.perks}</span>
              </span>
              <span className="shrink-0 font-bold text-[#0E2747]">{p.price}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={plan === null}
        onClick={() => setDone(true)}
        className="mt-5 w-full rounded-full bg-[#1C5BD6] px-6 py-3 font-semibold text-white transition hover:bg-[#1648AD] disabled:opacity-40"
      >
        Continue to secure checkout
      </button>
      <p className="mt-2 text-center text-[0.7rem] text-slate-400">
        Enrollment and payment are completed on {carrier}'s website.
      </p>
    </div>
  );
}

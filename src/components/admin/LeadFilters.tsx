/**
 * LeadFilters — one "Filters" button that opens an animated dropdown holding all three lead
 * filters (Product · Status · Date) in a 3-column row. Each column is its own Select that
 * opens its options on click. Closes on outside-click / Escape; shows an active-filter count.
 */
import { useEffect, useRef, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { FilterIcon, ChevronDownIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/cn';

interface Opt {
  value: string;
  label: string;
}

export function LeadFilters({
  product,
  status,
  date,
  onProduct,
  onStatus,
  onDate,
  productOptions,
  statusOptions,
  dateOptions,
}: {
  product: string;
  status: string;
  date: string;
  onProduct: (v: string) => void;
  onStatus: (v: string) => void;
  onDate: (v: string) => void;
  productOptions: Opt[];
  statusOptions: Opt[];
  dateOptions: Opt[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = [product, status, date].filter((v) => v !== 'all').length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const columns = [
    { label: 'Product', value: product, onChange: onProduct, options: productOptions, aria: 'Filter by product' },
    { label: 'Status', value: status, onChange: onStatus, options: statusOptions, aria: 'Filter by status' },
    { label: 'Date', value: date, onChange: onDate, options: dateOptions, aria: 'Filter by date' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
          open || activeCount > 0
            ? 'border-brand-red text-brand-white'
            : 'border-brand-steel text-brand-chrome hover:text-brand-white',
        )}
      >
        <FilterIcon className="text-base" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-white">
            {activeCount}
          </span>
        )}
        <ChevronDownIcon className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="animate-fade-up absolute left-0 top-full z-40 mt-2 w-[min(44rem,calc(100vw-2rem))] rounded-xl border border-brand-steel bg-brand-charcoal p-4 shadow-lift">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {columns.map((c) => (
              <div key={c.label}>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-chrome">
                  {c.label}
                </label>
                <Select className="w-full" aria-label={c.aria} value={c.value} onChange={c.onChange} options={c.options} />
              </div>
            ))}
          </div>
          {activeCount > 0 && (
            <div className="mt-4 flex justify-end border-t border-brand-steel/60 pt-3">
              <button
                type="button"
                onClick={() => {
                  onProduct('all');
                  onStatus('all');
                  onDate('all');
                }}
                className="text-xs font-medium text-brand-red hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

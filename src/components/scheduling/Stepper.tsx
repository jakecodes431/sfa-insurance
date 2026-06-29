import { cn } from '@/lib/cn';

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:gap-2">
      {steps.map((label, i) => (
        <li
          key={label}
          className={cn(
            'flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs sm:gap-2',
            i === current
              ? 'border-brand-red bg-brand-red/10 text-brand-white'
              : i < current
                ? 'border-brand-red/50 text-brand-chrome'
                : 'border-brand-steel text-brand-chrome/60',
          )}
        >
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold sm:h-5 sm:w-5',
              i <= current ? 'bg-brand-red text-brand-white' : 'bg-brand-steel text-brand-black',
            )}
          >
            {i + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}

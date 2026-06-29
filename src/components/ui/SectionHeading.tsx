import { cn } from '@/lib/cn';

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = 'left',
  className,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn(align === 'center' && 'flex flex-col items-center text-center', className)}>
      {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
      <h2 className="flex items-center gap-3 text-2xl sm:text-3xl lg:text-4xl">
        {/* Red speed-bar accent instead of a plain slash. */}
        <span
          aria-hidden
          className={cn('h-7 w-1.5 rounded-full bg-brand-red sm:h-8', align === 'center' && 'hidden')}
        />
        <span className="text-chrome">{title}</span>
      </h2>
      {subtitle && (
        <p className={cn('mt-3 max-w-2xl text-brand-chrome', align === 'left' && 'pl-4 sm:pl-[18px]')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

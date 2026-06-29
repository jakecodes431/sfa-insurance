/**
 * Select.tsx — branded custom dropdown (replaces the native <select>).
 *
 * Native selects can't be styled (the OS owns the popup, its corners, and the
 * open direction — it flips upward near the screen bottom). This renders a
 * rounded, on-brand menu that ALWAYS drops downward, with full keyboard support,
 * click-outside-to-close, and the selected row painted in brand red.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIcon, CheckIcon } from '@/components/ui/Icons';

export interface SelectOption {
  value: string;
  label: ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown when nothing is selected (also a selectable empty option). */
  placeholder?: string;
  disabled?: boolean;
  /** `sm` = compact inline filter; `md` = full-width form control (default). */
  size?: 'sm' | 'md';
  /** Extra classes for the outer wrapper (e.g. width). */
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  size = 'md',
  className,
  id,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // keyboard-highlighted row
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const selectedIndex = options.findIndex((o) => o.value === value);

  // Close when clicking outside the control.
  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocPointer);
    return () => document.removeEventListener('mousedown', onDocPointer);
  }, [open]);

  // Highlight the current selection each time the menu opens.
  useEffect(() => {
    if (open) setActive(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  function choose(index: number) {
    const opt = options[index];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(active);
        break;
    }
  }

  const trigger =
    size === 'sm'
      ? 'min-h-0 px-3 py-2 text-sm'
      : 'min-h-[44px] px-4 py-3 text-base';

  return (
    <div
      ref={rootRef}
      className={cn('relative', size === 'sm' ? 'inline-block' : 'w-full', className)}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border bg-brand-black text-left',
          'text-brand-white transition-colors focus:outline-none focus:ring-1 focus:ring-brand-red',
          open
            ? 'border-brand-red ring-1 ring-brand-red'
            : 'border-brand-steel hover:border-brand-chrome',
          disabled && 'cursor-not-allowed opacity-50',
          trigger,
        )}
      >
        <span className={cn('truncate', !selected && 'text-brand-chrome/60')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            open ? 'rotate-180 text-brand-red' : 'text-brand-chrome',
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className={cn(
            // top-full + mt-2 → the menu always opens DOWNWARD, never up.
            'absolute left-0 top-full z-50 mt-2 max-h-64 w-full overflow-auto',
            'rounded-xl border border-brand-steel bg-brand-charcoal p-1.5 shadow-lift',
            'animate-fade-up',
          )}
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            const isActive = i === active;
            return (
              <li key={o.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-brand-red text-brand-white'
                      : isActive
                        ? 'bg-brand-steel/40 text-brand-white'
                        : 'text-brand-chrome hover:text-brand-white',
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && <CheckIcon className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

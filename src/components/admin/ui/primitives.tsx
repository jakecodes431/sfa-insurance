/**
 * primitives.tsx — shared admin UI building blocks. Every tab is composed from these so
 * the dashboard is visually consistent and safe by default (destructive actions confirm,
 * lists show loading/error/empty states). Reusable across future client admins too.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { CloseIcon } from '@/components/ui/Icons';

/** Standard form panel: a card with a heading. */
export function FormCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('card space-y-3', className)}>
      <h3 className="text-lg text-brand-white">{title}</h3>
      {children}
    </div>
  );
}

/** Dashed placeholder shown when a list has no rows. */
export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-brand-steel/60 px-4 py-10 text-center text-sm text-brand-chrome">
      {message}
    </p>
  );
}

/**
 * Renders the loading / error / empty state for a list, or null when there's data to show.
 * Usage: `{listState ?? <ul>…</ul>}` where listState = <ListStatus … />  (returns element|null)
 */
export function ListStatus({
  loading,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: string;
  onRetry?: () => void;
}): ReactNode {
  const { t } = useTranslation();
  if (loading) return <p className="px-1 py-8 text-center text-sm text-brand-chrome">{t('admin.common.loading')}</p>;
  if (error)
    return (
      <div className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-4 py-6 text-center text-sm text-brand-red">
        <p>{error}</p>
        {onRetry && (
          <button className="btn-secondary mt-3 !py-2 !text-sm" onClick={onRetry}>
            {t('admin.common.retry')}
          </button>
        )}
      </div>
    );
  if (isEmpty) return <EmptyState message={emptyMessage} />;
  return null;
}

/** Search box with a clear button. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        className="input-field pr-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="search"
      />
      {value && (
        <button
          type="button"
          aria-label="clear"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-chrome hover:text-brand-red"
          onClick={() => onChange('')}
        >
          <CloseIcon className="text-base" />
        </button>
      )}
    </div>
  );
}

/** Prev / page-count / next pager. Renders nothing for a single page. */
export function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  const { t } = useTranslation();
  if (pageCount <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button className="btn-secondary !py-2 !text-sm disabled:opacity-40" disabled={page <= 0} onClick={() => onPage(page - 1)}>
        {t('admin.common.prev')}
      </button>
      <span className="text-sm text-brand-chrome">{t('admin.common.pageOf', { page: page + 1, total: pageCount })}</span>
      <button
        className="btn-secondary !py-2 !text-sm disabled:opacity-40"
        disabled={page >= pageCount - 1}
        onClick={() => onPage(page + 1)}
      >
        {t('admin.common.next')}
      </button>
    </div>
  );
}

/**
 * A destructive button that requires a second click to confirm (auto-disarms after 3s).
 * Replaces the old one-click deletes that could wipe a row instantly.
 */
export function ConfirmButton({
  onConfirm,
  children,
  className,
}: {
  onConfirm: () => void;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(id);
  }, [armed]);

  if (armed) {
    return (
      <button
        type="button"
        className={cn('btn-secondary !border-brand-red !py-2 !text-sm !text-brand-red md:!py-1 md:!text-xs', className)}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {t('admin.common.confirm')}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={cn('btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs', className)}
      onClick={() => setArmed(true)}
    >
      {children}
    </button>
  );
}

/**
 * useAdminData / usePagination — shared data plumbing for admin tabs.
 *
 * useAdminData standardizes the load → loading/error/empty lifecycle every tab used to
 * hand-roll (most didn't handle errors at all). `loading` is true only for the FIRST load;
 * reload() refetches silently so a save doesn't flash the list back to "Loading…".
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncData<T> {
  data: T;
  loading: boolean;
  error: string | null;
  /** Refetch without toggling the initial loading state. */
  reload: () => void;
}

export function useAdminData<T>(fetcher: () => Promise<T>, initial: T): AsyncData<T> {
  // Hold the latest fetcher in a ref so reload() stays referentially stable even though
  // tabs pass a fresh inline fetcher each render (avoids an effect loop).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setError(null);
    fetcherRef.current()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export interface Paged<T> {
  page: number;
  setPage: (p: number) => void;
  pageCount: number;
  pageItems: T[];
}

/** Client-side pagination over an in-memory list. Clamps page when the list shrinks. */
export function usePagination<T>(items: T[], perPage: number): Paged<T> {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(page, pageCount - 1);
  const start = current * perPage;
  return { page: current, setPage, pageCount, pageItems: items.slice(start, start + perPage) };
}

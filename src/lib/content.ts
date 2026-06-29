/**
 * content.ts — live, admin-editable site content (CMS overrides).
 *
 * The public site renders from config/i18n by default. When the tenant's admin edits a
 * content block, that value overrides the matching key here. In MOCK_MODE (no backend) there
 * are no overrides, so everything falls back to the built-in copy — the site looks identical.
 *
 * Usage: const headline = useContent('home.hero_headline', t('home.heroHeadline'));
 * The key must match the `key` of a row in sfp_tire_content_blocks for the override to apply.
 */
import { useEffect, useState } from 'react';
import { MOCK_MODE } from '@/config/env';
import * as sfp from './sfp';

let cache: Record<string, string | null> | null = null;
let inflight: Promise<Record<string, string | null>> | null = null;

/** Load the whole tenant content map once and memoize it. Failures degrade to {} (use fallbacks). */
function loadContent(): Promise<Record<string, string | null>> {
  if (MOCK_MODE) return Promise.resolve({});
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = sfp
      .publicContent()
      .then((d) => {
        cache = d;
        return d;
      })
      .catch(() => ({}) as Record<string, string | null>);
  }
  return inflight;
}

/** Returns the admin-edited value for `key` if set, otherwise `fallback`. */
export function useContent(key: string, fallback: string): string {
  const initial = cache?.[key];
  const [value, setValue] = useState<string>(initial != null && initial !== '' ? initial : fallback);

  useEffect(() => {
    let alive = true;
    void loadContent().then((map) => {
      if (!alive) return;
      const v = map[key];
      setValue(v != null && v !== '' ? v : fallback);
    });
    return () => {
      alive = false;
    };
  }, [key, fallback]);

  return value;
}

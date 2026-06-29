/**
 * asset.ts — resolve a /public asset path against the deploy base.
 *
 * The app may be served from a sub-path (e.g. GitHub Pages /sfa-insurance/), so public
 * asset URLs must be prefixed with import.meta.env.BASE_URL instead of a bare leading
 * slash. Pass either '/brand/x.png' or 'brand/x.png'.
 */
export const asset = (path: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');

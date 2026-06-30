import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { SchedulingProvider } from '@/components/scheduling/SchedulingProvider';
import { AdminHeader } from '@/components/admin/AdminHeader';

/** Internal pages where the public chat assistant should not appear. */
const HIDE_CHAT_ON = ['/admin', '/login', '/signup', '/dashboard'];

/** App shell: sticky header, routed content, footer. Mobile-first. */
export function AppLayout() {
  const location = useLocation();

  // Land at the top on a route change; on a hash (direct load or in-app), smooth-scroll
  // to that section once it has rendered.
  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  // BrowserRouter doesn't fire native fragment scrolling for raw "#anchor" links, so the
  // in-page CTAs (header nav, hero buttons, coverage rows, final CTA) updated the URL but
  // never moved the page. Delegate every same-page hash link to a reliable smooth
  // scrollIntoView — it respects each target's scroll-margin-top, so the fixed header
  // never overlaps the heading it lands on.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = decodeURIComponent((a.getAttribute('href') || '').slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Admin gets its own back-office chrome: a branded admin header (with the tabs as nav)
  // instead of the public marketing header, and no public footer / chat widget.
  if (location.pathname.startsWith('/admin')) {
    return (
      <div className="flex min-h-screen flex-col bg-brand-black">
        <AdminHeader />
        <main className="flex-1">
          <Suspense fallback={<div className="min-h-[60vh] bg-brand-black" />}>
            <div key={location.pathname} className="animate-page-in">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <SchedulingProvider>
    <div className="flex min-h-screen flex-col overflow-x-clip bg-brand-black">
      <Header />
      {/* Header is fixed (transparent overlay) → pad content down to clear it. The home
          hero cancels this with -mt-[var(--hdr-h)] to sit full-bleed behind the header. */}
      <main className="flex-1 pt-[var(--hdr-h)]">
        <Suspense fallback={<div className="min-h-[100svh] bg-brand-black" />}>
          {/* Keyed by path → replays page-in. */}
          <div
            key={location.pathname}
            className="animate-page-in flex min-h-[calc(100svh-var(--hdr-h))] flex-col bg-brand-black"
          >
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
      {!HIDE_CHAT_ON.some((p) => location.pathname.startsWith(p)) && <ChatWidget />}
    </div>
    </SchedulingProvider>
  );
}

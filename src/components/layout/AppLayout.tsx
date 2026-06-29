import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';

/** Internal pages where the public chat assistant should not appear. */
const HIDE_CHAT_ON = ['/admin', '/login', '/signup', '/dashboard'];

/** App shell: sticky header, routed content, footer. Mobile-first. */
export function AppLayout() {
  const location = useLocation();

  // Always land at the top on navigation. If the URL has a hash, defer to the
  // browser's in-page anchor scroll instead.
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
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
  );
}

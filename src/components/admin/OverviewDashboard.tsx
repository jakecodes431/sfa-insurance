/**
 * OverviewDashboard — the admin's first tab: at-a-glance KPIs, the lead pipeline, the
 * latest leads, and upcoming appointments. Reads the same mock/live data layer as the
 * other tabs (leads + bookings + reviews) so it stays in sync.
 */
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getAllLeads, getAllBookings } from '@/lib/data';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDateTime } from '@/lib/format';
import { getServiceBySlug } from '@/config/services.config';
import { testimonials } from '@/config/reviews.config';
import { ListStatus } from '@/components/admin/ui/primitives';
import type { LeadRow, BookingRow, LeadStatus } from '@/types/database.types';

const PIPELINE: LeadStatus[] = [
  'new',
  'contacted',
  'appointment_set',
  'quoted',
  'application_submitted',
  'enrolled',
  'not_a_fit',
];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface Bundle {
  leads: LeadRow[];
  bookings: BookingRow[];
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-chrome">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-bold leading-none text-brand-white">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-brand-chrome">{sub}</p>}
    </div>
  );
}

export function OverviewDashboard() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const { data, loading, error, reload } = useAdminData<Bundle>(
    async () => {
      const [leads, bookings] = await Promise.all([getAllLeads(), getAllBookings()]);
      return { leads, bookings };
    },
    { leads: [], bookings: [] },
  );

  if (loading || error) {
    return (
      <ListStatus loading={loading} error={error} isEmpty={false} emptyMessage="" onRetry={reload} />
    );
  }

  const { leads, bookings } = data;
  const now = Date.now();

  const newLeads = leads.filter((l) => l.status === 'new').length;
  const thisWeek = leads.filter((l) => now - new Date(l.created_at).getTime() <= WEEK_MS).length;
  const enrolled = leads.filter((l) => l.status === 'enrolled').length;
  const conversion = leads.length ? Math.round((enrolled / leads.length) * 100) : 0;

  const upcoming = bookings
    .filter(
      (b) =>
        b.scheduled_at &&
        new Date(b.scheduled_at).getTime() >= now &&
        (b.status === 'requested' || b.status === 'confirmed'),
    )
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

  const ratings = testimonials.map((r) => r.rating).filter((n) => n > 0);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const byStatus = PIPELINE.map((s) => ({ status: s, n: leads.filter((l) => l.status === s).length }));
  const maxStatus = Math.max(1, ...byStatus.map((x) => x.n));

  const recentLeads = [...leads]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="New leads" value={newLeads} sub="Awaiting first contact" />
        <Stat label="Leads this week" value={thisWeek} sub={`${leads.length} total`} />
        <Stat
          label="Upcoming appts"
          value={upcoming.length}
          sub={upcoming[0]?.scheduled_at ? `Next ${formatDateTime(upcoming[0].scheduled_at, locale)}` : 'None scheduled'}
        />
        <Stat
          label="Avg rating"
          value={avgRating ? avgRating.toFixed(1) : '—'}
          sub={`${conversion}% enrolled`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline */}
        <section className="card">
          <h3 className="font-display text-lg text-brand-white">Lead pipeline</h3>
          <ul className="mt-4 space-y-3">
            {byStatus.map(({ status, n }) => (
              <li key={status} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs leading-tight text-brand-chrome sm:text-sm">
                  {t(`leadStatus.${status}`)}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-black/40">
                  <div
                    className="h-full rounded-full bg-brand-red transition-all"
                    style={{ width: `${(n / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-semibold text-brand-white">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Upcoming appointments */}
        <section className="card">
          <h3 className="font-display text-lg text-brand-white">Upcoming appointments</h3>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-brand-chrome">No upcoming appointments.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.slice(0, 5).map((b) => {
                const svc = getServiceBySlug(b.service_slug);
                return (
                  <li key={b.id} className="flex items-center justify-between gap-3 border-b border-brand-steel/60 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-white">{b.guest_name ?? '—'}</p>
                      <p className="truncate text-xs text-brand-chrome">{svc?.name_en ?? b.service_slug}</p>
                    </div>
                    <span className="shrink-0 text-xs text-brand-chrome">
                      {b.scheduled_at ? formatDateTime(b.scheduled_at, locale) : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Recent leads */}
      <section className="card">
        <h3 className="font-display text-lg text-brand-white">Recent leads</h3>
        {recentLeads.length === 0 ? (
          <p className="mt-4 text-sm text-brand-chrome">No leads yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-brand-steel/60">
            {recentLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-white">{l.name}</p>
                  <p className="truncate text-xs text-brand-chrome">
                    {t(`productLine.${l.product_line}`)} · {formatDateTime(l.created_at, locale)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-brand-steel px-2 py-0.5 text-xs text-brand-chrome">
                  {t(`leadStatus.${l.status}`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

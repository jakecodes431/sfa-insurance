import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addReview, getAllReviews, setReviewFeatured } from '@/lib/data';
import { useAdminData } from '@/hooks/useAdminData';
import { Select } from '@/components/ui/Select';
import { StarIcon } from '@/components/ui/Icons';
import { FormCard, ListStatus } from '@/components/admin/ui/primitives';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { ReviewRow } from '@/types/database.types';

export function ReviewsManager() {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const { data: reviews, loading, error, reload } = useAdminData<ReviewRow[]>(getAllReviews, []);
  const [form, setForm] = useState({ author_name: '', rating: 5, body: '' });

  async function add() {
    if (!form.author_name.trim()) return;
    try {
      await addReview(form);
      setForm({ author_name: '', rating: 5, body: '' });
      toast.success(t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  async function toggleFeatured(r: ReviewRow, featured: boolean) {
    try {
      await setReviewFeatured(r.id, featured);
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <FormCard title={t('admin.reviewsManager.addNative')}>
        <input className="input-field" placeholder={t('admin.reviewsManager.author')} value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
        <Select
          aria-label={t('admin.reviewsManager.addNative')}
          value={String(form.rating)}
          onChange={(v) => setForm({ ...form, rating: Number(v) })}
          options={[5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `${r} ★` }))}
        />
        <textarea className="input-field" placeholder={t('admin.reviewsManager.body')} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button className="btn-primary w-full" onClick={add}>
          {t('admin.reviewsManager.addNative')}
        </button>
      </FormCard>

      <div>
        <ListStatus
          loading={loading}
          error={error}
          isEmpty={reviews.length === 0}
          emptyMessage={t('admin.reviewsManager.empty')}
          onRetry={reload}
        />
        {!loading && !error && reviews.length > 0 && (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-brand-white">
                    {r.author_name}
                    <span className="inline-flex items-center gap-0.5 text-brand-red">
                      · {r.rating}
                      <StarIcon className="text-sm" />
                    </span>
                  </p>
                  <p className="text-xs text-brand-chrome line-clamp-2">{r.body}</p>
                </div>
                <label className="flex shrink-0 items-center gap-2 text-xs text-brand-chrome">
                  <input type="checkbox" className="accent-brand-red" checked={r.featured} onChange={(e) => void toggleFeatured(r, e.target.checked)} />
                  {t('admin.reviewsManager.featured')}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

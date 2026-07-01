/**
 * AddLeadModal — manual lead entry from the admin (e.g. a phone-in). Creates a lead
 * through the same data layer as the public form, so it lands in the list + timeline.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { createLead } from '@/lib/data';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { ProductLineDb, CallWindow } from '@/types/database.types';

const PRODUCTS: ProductLineDb[] = [
  'medicare',
  'dental-vision',
  'life-final-expense',
  'under-65-health',
  'general',
];
const TIMES: CallWindow[] = ['anytime', 'morning', 'afternoon', 'evening'];

export function AddLeadModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [product, setProduct] = useState<ProductLineDb>('medicare');
  const [bestTime, setBestTime] = useState<CallWindow>('anytime');
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);

  function reset() {
    setName('');
    setPhone('');
    setEmail('');
    setZip('');
    setProduct('medicare');
    setBestTime('anytime');
    setConsent(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createLead({
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        zip: zip.trim() || null,
        product_line: product,
        best_time: bestTime,
        consent_contact: consent,
        source: 'manual: admin',
        status: 'new',
      });
      toast.success('Lead added');
      reset();
      onAdded();
      onClose();
    } catch {
      toast.error(t('admin.common.saveError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="add-lead-title" size="max-w-md">
      <form onSubmit={submit} className="px-6 pb-6 pt-8">
        <h2 id="add-lead-title" className="font-display text-xl font-bold text-brand-white">
          Add a lead
        </h2>
        <p className="mt-1 text-sm text-brand-chrome">For a call-in or walk-in inquiry.</p>

        <div className="mt-5 space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="input-field"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="input-field" />
            <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Zip" className="input-field" />
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <Select
              aria-label="Product line"
              value={product}
              onChange={(v) => setProduct(v as ProductLineDb)}
              options={PRODUCTS.map((p) => ({ value: p, label: t(`productLine.${p}`) }))}
            />
            <Select
              aria-label="Best time"
              value={bestTime}
              onChange={(v) => setBestTime(v as CallWindow)}
              options={TIMES.map((x) => ({ value: x, label: t(`lead.bestTimeOptions.${x}`) }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-chrome">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-4 w-4" />
            Consented to contact
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary !py-2 !text-sm">
            Cancel
          </button>
          <button type="submit" disabled={busy || !name.trim()} className="btn-primary !py-2 !text-sm disabled:opacity-40">
            Add lead
          </button>
        </div>
      </form>
    </Modal>
  );
}

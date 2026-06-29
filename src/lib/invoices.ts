/**
 * invoices.ts — custom invoice data layer (Phase 10).
 * Admin builds an invoice with line items, sends a pay link (tenant's Stripe Connect
 * account), and it's marked paid by the Stripe webhook (or manually for cash).
 * MOCK_MODE keeps everything local; send/pay are simulated (no live Stripe/n8n).
 */
import { MOCK_MODE } from '@/config/env';
import { mockStore, uuid } from './mockStore';
import { postEvent } from './automation';
import * as sfp from './sfp';
import type {
  InvoiceRow,
  InvoiceInsert,
  InvoiceLineItemRow,
  InvoiceStatus,
} from '@/types/database.types';

export interface LineItemInput {
  description: string;
  quantity: number;
  unit_price_cents: number;
}

export interface InvoiceWithItems {
  invoice: InvoiceRow;
  items: InvoiceLineItemRow[];
}

export function computeTotals(items: LineItemInput[], taxCents = 0) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price_cents, 0);
  return { subtotal_cents: subtotal, tax_cents: taxCents, total_cents: subtotal + taxCents };
}

export async function listInvoices(): Promise<InvoiceRow[]> {
  if (MOCK_MODE)
    return [...mockStore.db().invoices].sort((a, b) => b.invoice_number - a.invoice_number);
  return sfp.listInvoices();
}

export async function getInvoice(id: string): Promise<InvoiceWithItems | null> {
  if (MOCK_MODE) {
    const invoice = mockStore.db().invoices.find((i) => i.id === id);
    if (!invoice) return null;
    const items = mockStore
      .db()
      .invoiceLineItems.filter((li) => li.invoice_id === id)
      .sort((a, b) => a.sort_order - b.sort_order);
    return { invoice, items };
  }
  return sfp.getInvoiceBundle(id);
}

/** Create or update a draft invoice with its line items (replaces items). */
export async function saveInvoice(
  input: Omit<InvoiceInsert, 'subtotal_cents' | 'tax_cents' | 'total_cents'> & { id?: string },
  items: LineItemInput[],
): Promise<InvoiceRow> {
  const totals = computeTotals(items, 0);

  if (MOCK_MODE) {
    const db = mockStore.db();
    let invoice = input.id ? db.invoices.find((i) => i.id === input.id) : undefined;
    if (invoice) {
      Object.assign(invoice, input, totals, { updated_at: mockStore.nowIso() });
    } else {
      const nextNumber =
        Math.max(0, ...db.invoices.map((i) => i.invoice_number)) + 1;
      invoice = {
        id: input.id ?? uuid(),
        tenant_id: input.tenant_id ?? mockStore.tenantId,
        invoice_number: nextNumber,
        customer_profile_id: input.customer_profile_id ?? null,
        customer_name: input.customer_name,
        customer_email: input.customer_email ?? null,
        customer_phone: input.customer_phone ?? null,
        status: input.status ?? 'draft',
        currency: input.currency ?? 'usd',
        ...totals,
        notes: input.notes ?? null,
        due_date: input.due_date ?? null,
        stripe_payment_intent_id: null,
        stripe_invoice_id: null,
        hosted_pay_url: null,
        locale: input.locale ?? 'en',
        created_at: mockStore.nowIso(),
        updated_at: mockStore.nowIso(),
      };
      db.invoices.unshift(invoice);
    }
    // replace line items
    db.invoiceLineItems = db.invoiceLineItems.filter((li) => li.invoice_id !== invoice!.id);
    items.forEach((it, idx) => {
      db.invoiceLineItems.push({
        id: uuid(),
        invoice_id: invoice!.id,
        description: it.description,
        quantity: it.quantity,
        unit_price_cents: it.unit_price_cents,
        amount_cents: it.quantity * it.unit_price_cents,
        sort_order: idx,
      });
    });
    mockStore.save();
    return invoice;
  }

  return sfp.saveInvoice({ ...input, ...totals }, items);
}

/** Mark an invoice "sent" and emit the n8n event (which, when wired, emails a Stripe pay link). */
export async function sendInvoice(invoice: InvoiceRow): Promise<InvoiceRow> {
  const hosted_pay_url = `/invoice/${invoice.id}/pay`; // real hosted URL comes from Stripe at wire-up
  if (MOCK_MODE) {
    const inv = mockStore.db().invoices.find((i) => i.id === invoice.id);
    if (inv) {
      inv.status = 'sent';
      inv.hosted_pay_url = hosted_pay_url;
      inv.updated_at = mockStore.nowIso();
    }
    mockStore.save();
    await postEvent('invoice.sent', {
      locale: invoice.locale,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer_email: invoice.customer_email ?? '',
      total_cents: invoice.total_cents,
      hosted_pay_url,
    });
    return inv ?? invoice;
  }
  const updated = await sfp.updateInvoice(invoice.id, { status: 'sent', hosted_pay_url });
  await postEvent('invoice.sent', {
    locale: invoice.locale,
    invoice_id: invoice.id,
    invoice_number: invoice.invoice_number,
    customer_email: invoice.customer_email ?? '',
    total_cents: invoice.total_cents,
    hosted_pay_url,
  });
  return updated ?? invoice;
}

export async function setInvoiceStatus(
  id: string,
  status: InvoiceStatus,
  paymentIntentId?: string,
): Promise<void> {
  if (MOCK_MODE) {
    const inv = mockStore.db().invoices.find((i) => i.id === id);
    if (inv) {
      inv.status = status;
      if (paymentIntentId) inv.stripe_payment_intent_id = paymentIntentId;
      inv.updated_at = mockStore.nowIso();
    }
    mockStore.save();
    return;
  }
  await sfp.updateInvoice(id, { status, stripe_payment_intent_id: paymentIntentId ?? null });
}

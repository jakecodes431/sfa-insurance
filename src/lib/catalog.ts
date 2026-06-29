/**
 * catalog.ts — owner-managed service catalog data layer.
 * Service categories are tenant-scoped and editable from the admin panel.
 * (The public services pages remain config-driven by default; once a tenant edits
 * its catalog, those pages bind here — the schema + data layer are ready. See WIRE-UP.)
 */
import { MOCK_MODE } from '@/config/env';
import { mockStore, uuid } from './mockStore';
import * as sfp from './sfp';
import type { ServiceCategoryRow, ServiceCategoryInsert } from '@/types/database.types';

export async function listCategories(): Promise<ServiceCategoryRow[]> {
  if (MOCK_MODE)
    return [...mockStore.db().serviceCategories].sort((a, b) => a.sort_order - b.sort_order);
  return sfp.listCategories();
}

export async function upsertCategory(input: ServiceCategoryInsert): Promise<ServiceCategoryRow> {
  if (MOCK_MODE) {
    const db = mockStore.db();
    const existing = input.id ? db.serviceCategories.find((c) => c.id === input.id) : undefined;
    if (existing) {
      Object.assign(existing, input);
      mockStore.save();
      return existing;
    }
    const row: ServiceCategoryRow = {
      id: input.id ?? uuid(),
      tenant_id: input.tenant_id ?? mockStore.tenantId,
      name_en: input.name_en,
      name_es: input.name_es,
      sort_order: input.sort_order ?? db.serviceCategories.length + 1,
      active: input.active ?? true,
      created_at: mockStore.nowIso(),
    };
    db.serviceCategories.push(row);
    mockStore.save();
    return row;
  }
  return sfp.upsertCategory(input);
}

export async function deleteCategory(id: string): Promise<void> {
  if (MOCK_MODE) {
    const db = mockStore.db();
    db.serviceCategories = db.serviceCategories.filter((c) => c.id !== id);
    mockStore.save();
    return;
  }
  await sfp.deleteCategory(id);
}

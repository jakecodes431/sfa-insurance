/**
 * crm.ts — lightweight lead-CRM types (notes + activity timeline) layered on top of the
 * lead record. Demo-persisted in the mock store; in the live build these map to
 * sfp_ins_lead_notes / sfp_ins_lead_activity tables.
 */
export interface LeadNote {
  id: string;
  lead_id: string;
  body: string;
  author: string;
  created_at: string;
}

export type LeadActivityKind = 'created' | 'status' | 'note' | 'email' | 'sms';

export interface LeadActivity {
  id: string;
  lead_id: string;
  kind: LeadActivityKind;
  label: string;
  created_at: string;
}

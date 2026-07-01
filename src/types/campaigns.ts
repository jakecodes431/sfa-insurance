/**
 * campaigns.ts — carrier campaign links. Each campaign is a shareable /c/<slug> link the
 * agent puts in marketing; it routes through the SFA site (logging the click + optionally
 * capturing the lead) before handing off to the carrier's enrollment page. Demo-persisted;
 * live maps to sfp_ins_campaigns + sfp_ins_campaign_events.
 */
export interface Campaign {
  id: string;
  name: string;
  carrier: string;
  /** Self-serve lanes only (dental-vision | life-final-expense). Never Medicare. */
  product_line: string;
  /** The agent's carrier enrollment link (where the commission is earned). */
  agent_url: string;
  slug: string;
  /** Try to embed the carrier page in an iframe (most carriers block this). */
  embed: boolean;
  enabled: boolean;
  created_at: string;
}

export type CampaignEventKind = 'click' | 'capture';

export interface CampaignEvent {
  id: string;
  campaign_id: string;
  kind: CampaignEventKind;
  lead_id?: string | null;
  created_at: string;
}

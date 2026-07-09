/**
 * PRD Module 1 (Section 1.4.3) — `fi_leads` table. Mirrors oncre-backend's
 * `FiLead` model (src/app/fi-lead/model/fi-lead.model.ts); served from
 * `/api/leads/fi`, which tries the real backend first and falls back to a
 * local mock record only if it's unreachable.
 */
export enum NplVolumeBracket {
  UNDER_50M = "UNDER_50M",
  BETWEEN_50M_500M = "50M_500M",
  ABOVE_500M = "ABOVE_500M",
  UNDISCLOSED = "UNDISCLOSED",
}

export enum FiLeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  LOST = "LOST",
}

export interface FiLead {
  id: string;
  full_name: string;
  institution_name: string;
  npl_volume_bracket: NplVolumeBracket;
  work_email: string;
  phone_number: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  status: FiLeadStatus;
  bot_suspected: boolean;
  created_at: string;
}

export interface CreateFiLeadInput {
  full_name: string;
  institution_name: string;
  npl_volume_bracket: NplVolumeBracket;
  work_email: string;
  phone_number: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

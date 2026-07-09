import type { Merchant } from "./merchant";

/** Mirrors oncre-backend `CaseStatus` (src/app/case/types/case.interface.ts). */
export enum CaseStatus {
  ACTIVE = "ACTIVE",
  LEGAL = "LEGAL",
  WRITE_OFF = "WRITE_OFF",
  DISPUTED = "DISPUTED",
  COMPLETED = "COMPLETED",
  PENDING_TRANSITION = "PENDING_TRANSITION",
  FULLY_RECOVERED = "FULLY_RECOVERED",
  PARTIALLY_RECOVERED = "PARTIALLY_RECOVERED",
  WRITTEN_OFF = "WRITTEN_OFF",
}

export enum RecoveryMode {
  ESCALATION = "ESCALATION",
  PAYMENT_PLAN = "PAYMENT_PLAN",
  COMPLETED = "COMPLETED",
}

export enum DisputeStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
  ESCALATED = "ESCALATED",
}

export enum TransitionOutcome {
  FULLY_RECOVERED = "FULLY_RECOVERED",
  PARTIALLY_RECOVERED = "PARTIALLY_RECOVERED",
  ESCALATE_TO_LEGAL = "ESCALATE_TO_LEGAL",
  WRITE_OFF = "WRITE_OFF",
}

export interface Dispute {
  _id: string;
  case_id: string;
  call_id: string;
  note?: string;
  status: DisputeStatus;
  resolved_at?: string;
  escalated_at?: string;
  created_at?: string;
}

/** Mirrors oncre-backend `Case` model (src/app/case/model/case.model.ts). */
export interface Case {
  _id: string;
  case_id: string;
  merchant_id: string;
  merchant?: Merchant;
  debtor_name: string;
  debtor_phone: string;
  debtor_address?: string;
  wholesaler_name?: string;
  amount: number;
  description?: string;
  due_date: string;
  status: CaseStatus;
  escalation_level: number;
  current_day: number;
  is_paused: boolean;
  hold?: boolean;
  hold_until?: string;
  pause_reason?: string;
  recovery_mode?: RecoveryMode;
  payment_plan_id?: string;
  outstanding_balance?: number;
  transition_required?: boolean;
  transition_due_at?: string;
  activated_at: string;
  created_at?: string;
  updated_at?: string;
  /** Populated only when an OPEN dispute exists for this case. */
  dispute?: Dispute | null;
}

/** Payload for `POST /api/v1/cases` (single-debtor creation, staff-facing). */
export interface CreateCaseInput {
  /** Real backend merchant_id (e.g. MER-00007) — when present, the backend attaches the
   *  case to this exact Merchant instead of resolving one via merchant_name/merchant_phone. */
  merchant_id?: string;
  merchant_name: string;
  merchant_phone: string;
  debtor_name: string;
  debtor_phone: string;
  debtor_address?: string;
  wholesaler_name?: string;
  amount: number;
  description?: string;
  due_date: string;
}

export interface TransitionCaseInput {
  confirmationText: string;
  outcome: TransitionOutcome;
  note?: string;
}

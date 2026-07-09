import type { PaymentStatus } from "./payment";

export enum EscalationTier {
  TIER_0 = 0,
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
}

/**
 * Mirrors a read-only subset of oncre-backend's `Credit` model
 * (src/app/credit/model/credit.model.ts) — the lightweight, bulk-imported
 * credit ledger that drives the messaging engine independent of Cases.
 * Read-only in the staff console; no create/update endpoint is in scope.
 */
export interface Credit {
  _id: string;
  credit_id: string;
  merchant_id: string;
  customer_key: string;
  customer_name: string;
  customer_phone: string;
  credit_amount: number;
  credit_date?: string;
  due_date?: string;
  payment_status: PaymentStatus;
  total_paid?: number;
  escalation_tier?: EscalationTier;
  created_at?: string;
}

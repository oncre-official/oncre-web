export enum PaymentStatus {
  UNPAID = "Unpaid",
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "Paid",
  FAILED = "failed",
}

/**
 * The backend's Payment model already models `ACTIVATION` alongside `CASE`
 * (src/app/payment/types/payment.interface.ts) even though only case payment
 * plans are wired up today — see docs/BACKEND_INTEGRATION.md.
 */
export enum PaymentType {
  CASE = "CASE",
  ACTIVATION = "ACTIVATION",
}

export enum TrancheType {
  Week = "week",
  Month = "month",
}

/** Mirrors oncre-backend `Payment` model (src/app/payment/model/payment.model.ts). */
export interface Payment {
  _id: string;
  payment_id: string;
  merchant_id: string;
  case_id: string;
  type: PaymentType;
  amount: number;
  amount_paid?: number;
  status: PaymentStatus;
  reference?: string;
  provider?: string;
  payment_url?: string;
  confirmed_at?: string;
  paid_at?: string;
  created_at?: string;
}

/** Payload for `POST /api/v1/payments` (creates a repayment plan for an existing case). */
export interface CreatePaymentPlanInput {
  case_id: string;
  type: TrancheType;
  value: number;
}

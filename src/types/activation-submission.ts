import type { MerchantPaymentStatus } from "./payment";

/** Shape returned by `GET /api/v1/agents/activation-fee` — Payment+Merchant+Agent join, admin/super-admin only. */
export interface ActivationFeeSubmission {
  _id: string;
  payment_id: string;
  merchant_id: string;
  amount: number;
  receipt_url: string;
  merchant_status: MerchantPaymentStatus;
  created_at: string;
  merchant_name?: string;
  merchant_phone?: string;
  merchant_store_name?: string;
  location?: string;
  agent_first_name?: string;
  agent_last_name?: string;
  zone?: string;
}

export enum ActivationFeeSortField {
  DATE = "date",
  AGENT = "agent",
  ZONE = "zone",
  MERCHANT_NAME = "merchant_name",
  AMOUNT = "amount",
}

export type SortDirection = "asc" | "desc";

export interface ListActivationFeeSubmissionsParams {
  skip?: number;
  limit?: number;
  agent_name?: string;
  zone?: string;
  merchant_status?: MerchantPaymentStatus;
  sort_by?: ActivationFeeSortField;
  sort_dir?: SortDirection;
}

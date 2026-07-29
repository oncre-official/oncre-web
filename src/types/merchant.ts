/** Mirrors backend `MerchantApprovalStatus` (src/app/merchant/types/merchant.interface.ts). */
export enum MerchantApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

/** Mirrors oncre-backend `Merchant` model (src/app/merchant/model/merchant.model.ts). */
export interface Merchant {
  _id: string;
  merchant_id: string;
  user_id?: string;
  merchant_name: string;
  merchant_store_name: string;
  merchant_phone: string;
  business_type?: string;
  location: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  channel?: string;
  activated: boolean;
  activated_at?: string;
  /** Admin deactivation flag — independent of `activated` (onboarding fee). */
  is_active: boolean;
  /** Approval gate for merchants created by sales/field-agent staff — exempt (APPROVED) otherwise. */
  approval_status: MerchantApprovalStatus;
  created_at?: string;
  created_by?: string;
  /** Populated only on `GET /api/staff/merchants/:id`. */
  creator?: { _id: string; email?: string; phone?: string };
}

export interface CreateMerchantInput {
  merchant_name: string;
  merchant_store_name: string;
  merchant_phone: string;
  business_type: string;
  location: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
}

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
  channel?: string;
  activated: boolean;
  activated_at?: string;
  created_at?: string;
}

export interface CreateMerchantInput {
  merchant_name: string;
  merchant_store_name: string;
  merchant_phone: string;
  location: string;
}

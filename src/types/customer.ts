export enum CustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  CASH_ONLY = "cash_only",
}

/** Mirrors oncre-backend `Customer` model (src/app/customer/model/customer.model.ts). */
export interface Customer {
  _id: string;
  customer_id: string;
  customer_key: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  business_name?: string;
  status: CustomerStatus;
  created_at?: string;
  created_by?: string;
  /** Populated only on `GET /api/staff/customers/:id`. */
  creator?: { _id: string; email?: string; phone?: string };
}

/** Payload for `POST /api/v1/customers`. */
export interface CreateCustomerInput {
  customer_name: string;
  business_name?: string;
  customer_phone: string;
}

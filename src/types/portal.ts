import type { Case } from "./case";

/**
 * PRD Module 2 self-serve merchant identity. The real oncre-backend has no
 * self-registration endpoint (only staff-driven `POST /api/v1/merchants`), so
 * this whole lifecycle is served by the local mock BFF under `/api/auth/*`,
 * `/api/payments/*` and `/api/cases/*`. See docs/BACKEND_INTEGRATION.md.
 */
export enum PortalAccountStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  VERIFIED_PENDING_PAYMENT = "VERIFIED_PENDING_PAYMENT",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum BusinessType {
  RETAIL = "Retail",
  WHOLESALE = "Wholesale",
  DISTRIBUTION = "Distribution",
  SERVICES = "Services",
  OTHER = "Other",
}

export interface PortalAccount {
  merchant_id: string;
  full_name: string;
  business_name: string;
  business_type: BusinessType;
  email: string;
  phone: string;
  status: PortalAccountStatus;
  created_at: string;
  activated_at?: string;
}

export interface RegisterPortalAccountInput {
  full_name: string;
  business_name: string;
  business_type: BusinessType;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyOtpInput {
  merchant_id: string;
  otp_code: string;
}

export interface PortalSession {
  merchant_id: string;
  token: string;
}

/** PRD 2.4.4 — the 8-column CSV template / manual-entry schema. */
export interface DebtorRecordInput {
  debtor_full_name: string;
  debtor_phone: string;
  debtor_email?: string;
  business_name?: string;
  amount_owed_ngn: number;
  invoice_reference?: string;
  debt_date: string;
  notes?: string;
}

export interface RowError {
  row: number;
  column: string;
  message: string;
}

export interface BulkUploadResult {
  total: number;
  valid: number;
  invalid: number;
  cases_created: Case[];
  errors: RowError[];
}

/** Where a Kanban case record actually came from — surfaced in the UI so the
 * hybrid real/mock integration stays transparent rather than hidden. */
export type CaseSource = "backend" | "mock";

export interface SourcedCase extends Case {
  source: CaseSource;
}

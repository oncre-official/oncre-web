import { apiRequest } from "./http-json";
import type { Call } from "@/types/call";
import type { Message } from "@/types/message";
import type { Payment } from "@/types/payment";
import type {
  DebtorRecordInput,
  PortalAccount,
  RegisterPortalAccountInput,
  BulkUploadResult,
  SourcedCase,
} from "@/types/portal";

export function getSession(): Promise<{ account: PortalAccount | null }> {
  return apiRequest("/api/auth/session");
}

export function register(input: RegisterPortalAccountInput): Promise<{ merchant_id: string; dev_otp: string }> {
  return apiRequest("/api/auth/register", { method: "POST", body: input });
}

export function verifyOtp(input: { merchant_id: string; otp_code: string }): Promise<{ account: PortalAccount }> {
  return apiRequest("/api/auth/verify-otp", { method: "POST", body: input });
}

export function resendOtp(merchant_id: string): Promise<{ dev_otp: string }> {
  return apiRequest("/api/auth/resend-otp", { method: "POST", body: { merchant_id } });
}

export function login(value: string, password: string): Promise<{ account: PortalAccount }> {
  return apiRequest("/api/auth/login", { method: "POST", body: { value, password } });
}

export function logout(): Promise<null> {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export function initiateActivation(): Promise<{
  reference: string;
  amount_kobo: number;
  currency: string;
  payment_url?: string;
}> {
  return apiRequest("/api/payments/initiate", { method: "POST" });
}

export function verifyActivation(reference: string): Promise<{ activated: boolean; account?: PortalAccount }> {
  return apiRequest("/api/payments/verify", { method: "POST", body: { reference } });
}

export function addManualCase(input: DebtorRecordInput): Promise<SourcedCase> {
  return apiRequest("/api/cases/manual", { method: "POST", body: input });
}

export function bulkUploadCases(rows: Record<string, string>[]): Promise<BulkUploadResult & { job_id: string }> {
  return apiRequest("/api/cases/bulk-upload", { method: "POST", body: { rows } });
}

export function listMyCases(): Promise<SourcedCase[]> {
  return apiRequest("/api/merchant/cases");
}

export function getCaseDetail(
  caseId: string,
): Promise<{ case: SourcedCase; calls: Call[]; messages: Message[]; payments: Payment[] }> {
  return apiRequest(`/api/merchant/cases/${encodeURIComponent(caseId)}`);
}

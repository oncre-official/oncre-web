import { apiRequest, toQueryString } from "@/lib/api/http-json";
import type { CreatePaymentPlanFormOutput } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Payment, PaymentInstallment } from "@/types/payment";

export function listPayments(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Payment>> {
  return apiRequest(`/api/staff/payments?${toQueryString(params)}`);
}

export function createPaymentPlan(input: CreatePaymentPlanFormOutput): Promise<Payment> {
  return apiRequest("/api/staff/payments", { method: "POST", body: input });
}

export function listInstallments(caseId: string): Promise<PaymentInstallment[]> {
  return apiRequest(`/api/staff/payments/installments?${toQueryString({ case_id: caseId })}`);
}

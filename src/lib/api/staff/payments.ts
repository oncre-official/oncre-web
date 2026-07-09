import { apiRequest } from "@/lib/api/http-json";
import type { CreatePaymentPlanFormOutput } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Payment } from "@/types/payment";

export function listPayments(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Payment>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/payments?${query}`);
}

export function createPaymentPlan(input: CreatePaymentPlanFormOutput): Promise<Payment> {
  return apiRequest("/api/staff/payments", { method: "POST", body: input });
}

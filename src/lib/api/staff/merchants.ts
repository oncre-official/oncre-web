import { apiRequest } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { CreateMerchantInput, Merchant } from "@/types/merchant";

export function listMerchants(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Merchant>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/merchants?${query}`);
}

export function createMerchant(input: CreateMerchantInput): Promise<Merchant> {
  return apiRequest("/api/staff/merchants", { method: "POST", body: input });
}

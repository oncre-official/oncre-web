import { apiRequest, toQueryString } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { CreateMerchantInput, Merchant } from "@/types/merchant";

export function listMerchants(
  params: { skip?: number; limit?: number; search?: string } = {},
): Promise<ListResult<Merchant>> {
  return apiRequest(`/api/staff/merchants?${toQueryString(params)}`);
}

export function searchMerchants(search: string, limit = 20): Promise<ListResult<Merchant>> {
  return listMerchants({ search, limit });
}

export function createMerchant(input: CreateMerchantInput): Promise<Merchant> {
  return apiRequest("/api/staff/merchants", { method: "POST", body: input });
}

export function getMerchant(id: string): Promise<Merchant> {
  return apiRequest(`/api/staff/merchants/${id}`);
}

export function deactivateMerchant(id: string): Promise<Merchant> {
  return apiRequest(`/api/staff/merchants/${id}/deactivate`, { method: "PATCH" });
}

export function approveMerchant(id: string): Promise<Merchant> {
  return apiRequest(`/api/staff/merchants/${id}/approve`, { method: "PATCH" });
}

export function rejectMerchant(id: string): Promise<Merchant> {
  return apiRequest(`/api/staff/merchants/${id}/reject`, { method: "PATCH" });
}

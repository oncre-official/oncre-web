import { apiRequest, toQueryString } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { CreateCustomerInput, Customer, DebtorRestriction } from "@/types/customer";

export function listCustomers(
  params: { skip?: number; limit?: number; search?: string } = {},
): Promise<ListResult<Customer>> {
  return apiRequest(`/api/staff/customers?${toQueryString(params)}`);
}

export function searchCustomers(search: string, limit = 20): Promise<ListResult<Customer>> {
  return listCustomers({ search, limit });
}

export function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  return apiRequest("/api/staff/customers", { method: "POST", body: input });
}

export function getCustomer(id: string): Promise<Customer> {
  return apiRequest(`/api/staff/customers/${id}`);
}

export function deactivateCustomer(id: string): Promise<Customer> {
  return apiRequest(`/api/staff/customers/${id}/deactivate`, { method: "PATCH" });
}

export function setCashOnly(id: string, reason?: string): Promise<Customer> {
  return apiRequest(`/api/staff/customers/${id}/cash-only`, { method: "PATCH", body: { reason } });
}

export function clearCashOnly(id: string, reason?: string): Promise<Customer> {
  return apiRequest(`/api/staff/customers/${id}/clear-cash-only`, { method: "PATCH", body: { reason } });
}

export function getRestrictions(id: string): Promise<DebtorRestriction[]> {
  return apiRequest(`/api/staff/customers/${id}/restrictions`);
}

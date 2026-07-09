import { apiRequest } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { CreateCustomerInput, Customer } from "@/types/customer";

export function listCustomers(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Customer>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/customers?${query}`);
}

export function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  return apiRequest("/api/staff/customers", { method: "POST", body: input });
}

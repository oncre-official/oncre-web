import { apiRequest } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { Credit } from "@/types/credit";

export function listCredits(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Credit>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/credits?${query}`);
}

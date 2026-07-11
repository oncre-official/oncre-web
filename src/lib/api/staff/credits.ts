import { apiRequest, toQueryString } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { Credit } from "@/types/credit";

export function listCredits(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Credit>> {
  return apiRequest(`/api/staff/credits?${toQueryString(params)}`);
}

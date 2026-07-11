import { apiRequest, toQueryString } from "@/lib/api/http-json";
import type { LogCallOutcomeFormValues } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Call, CallLog } from "@/types/call";

export function listCalls(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Call>> {
  return apiRequest(`/api/staff/calls?${toQueryString(params)}`);
}

export function listPrivilegedCalls(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Call>> {
  return apiRequest(`/api/staff/calls/list?${toQueryString(params)}`);
}

export function logCallOutcome(input: LogCallOutcomeFormValues): Promise<CallLog> {
  return apiRequest("/api/staff/call-logs/log", { method: "POST", body: input });
}

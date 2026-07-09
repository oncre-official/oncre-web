import { apiRequest } from "@/lib/api/http-json";
import type { LogCallOutcomeFormValues } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Call, CallLog } from "@/types/call";

export function listCalls(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Call>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/calls?${query}`);
}

export function listPrivilegedCalls(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Call>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/calls/list?${query}`);
}

export function logCallOutcome(input: LogCallOutcomeFormValues): Promise<CallLog> {
  return apiRequest("/api/staff/call-logs/log", { method: "POST", body: input });
}

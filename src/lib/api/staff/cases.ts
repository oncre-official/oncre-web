import { apiRequest } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { Case, CreateCaseInput, Dispute } from "@/types/case";
import type { TransitionCaseFormValues } from "@/lib/validation/staff.schema";

export function listCases(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Case>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/cases?${query}`);
}

export function createCase(input: CreateCaseInput): Promise<Case> {
  return apiRequest("/api/staff/cases", { method: "POST", body: input });
}

export function resolveDispute(disputeId: string): Promise<Dispute> {
  return apiRequest(`/api/staff/cases/dispute/resolve/${disputeId}`, { method: "POST" });
}

export function escalateDispute(disputeId: string): Promise<Dispute> {
  return apiRequest(`/api/staff/cases/dispute/escalate/${disputeId}`, { method: "POST" });
}

/** Fire-and-forget on the backend — re-fetch the case list afterward rather than trust the response. See the route handler's doc comment. */
export function transitionCase(caseObjectId: string, input: TransitionCaseFormValues): Promise<null> {
  return apiRequest(`/api/staff/cases/${caseObjectId}/transition`, { method: "POST", body: input });
}

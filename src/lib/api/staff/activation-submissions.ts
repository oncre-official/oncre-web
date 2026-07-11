import { apiRequest, toQueryString } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { ActivationFeeSubmission, ListActivationFeeSubmissionsParams } from "@/types/activation-submission";

export function listActivationFeeSubmissions(
  params: ListActivationFeeSubmissionsParams = {},
): Promise<ListResult<ActivationFeeSubmission>> {
  return apiRequest(`/api/staff/agents/activation-fee?${toQueryString(params)}`);
}

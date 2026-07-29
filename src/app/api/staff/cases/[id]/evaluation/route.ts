import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { CASE_LIST_ROLES } from "@/lib/utils/staff-permissions";
import type { DebtEvaluation } from "@/types/case";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaffRole(CASE_LIST_ROLES);
    const { id } = await params;

    const evaluation = await staffBackendRequest<DebtEvaluation>(session.token, `/cases/${id}/evaluation`);

    return jsonSuccess(evaluation, "Debt evaluation computed successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

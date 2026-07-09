import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { CASE_ACTION_ROLES } from "@/lib/utils/staff-permissions";
import type { Dispute } from "@/types/case";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** `id` here is the Dispute's own `_id`, not the case_id — see CaseController#escalateDispute. */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaffRole(CASE_ACTION_ROLES);
    const { id } = await params;

    const dispute = await staffBackendRequest<Dispute>(session.token, `/cases/dispute/escalate/${id}`, {
      method: "POST",
    });

    return jsonSuccess(dispute, "Dispute escalated successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

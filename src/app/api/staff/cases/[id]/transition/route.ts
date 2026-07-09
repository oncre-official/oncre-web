import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { CASE_ACTION_ROLES } from "@/lib/utils/staff-permissions";
import { transitionCaseSchema } from "@/lib/validation/staff.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * `id` here is the Case document's own `_id` — see CaseController#transition.
 * Note: the backend's `transitionCase` service assigns each outcome's result
 * without awaiting it before responding, so `data` on a successful response
 * is unreliable (effectively empty) even though the underlying case update
 * does land moments later. Callers should treat this as fire-and-forget and
 * re-fetch the case list afterward rather than trust the response body.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireStaffRole(CASE_ACTION_ROLES);
    const { id } = await params;

    const body = await request.json();
    const parsed = transitionCaseSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid transition details");

    await staffBackendRequest(session.token, `/cases/${id}/transition`, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(null, "Case transitioned successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { CALL_PRIVILEGED_ROLES } from "@/lib/utils/staff-permissions";
import { logCallOutcomeSchema } from "@/lib/validation/staff.schema";
import type { CallLog } from "@/types/call";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffRole(CALL_PRIVILEGED_ROLES);

    const body = await request.json();
    const parsed = logCallOutcomeSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid call outcome");

    const callLog = await staffBackendRequest<CallLog>(session.token, "/call-logs/log", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(callLog, "Call outcome logged successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}

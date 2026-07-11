import { NextRequest } from "next/server";

import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { AOP_SUBMISSIONS_ROLES } from "@/lib/utils/staff-permissions";
import type { ListResult } from "@/types/api";
import type { ActivationFeeSubmission } from "@/types/activation-submission";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffRole(AOP_SUBMISSIONS_ROLES);
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<ActivationFeeSubmission>>(
      session.token,
      `/agents/activation-fee?${query}`,
    );
    return jsonSuccess(result, "Field agent activation submissions fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

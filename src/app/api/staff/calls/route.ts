import { NextRequest } from "next/server";

import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { CALL_PRIVILEGED_ROLES } from "@/lib/utils/staff-permissions";
import type { ListResult } from "@/types/api";
import type { Call } from "@/types/call";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffRole(CALL_PRIVILEGED_ROLES);
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<Call>>(session.token, `/calls?${query}`);
    return jsonSuccess(result, "Calls fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

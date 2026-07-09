import { NextRequest } from "next/server";

import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import type { ListResult } from "@/types/api";
import type { Call } from "@/types/call";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<Call>>(session.token, `/calls?${query}`);
    return jsonSuccess(result, "Calls fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

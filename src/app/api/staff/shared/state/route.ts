import { NextRequest } from "next/server";

import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import type { StateRecord } from "@/types/shared";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const query = request.nextUrl.searchParams.toString();
    const states = await staffBackendRequest<StateRecord[]>(session.token, `/shared/state?${query}`);
    return jsonSuccess(states, "States fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

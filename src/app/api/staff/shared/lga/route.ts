import { NextRequest } from "next/server";

import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import type { LgaRecord } from "@/types/shared";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const query = request.nextUrl.searchParams.toString();
    const lgas = await staffBackendRequest<LgaRecord[]>(session.token, `/shared/lga?${query}`);
    return jsonSuccess(lgas, "LGAs fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

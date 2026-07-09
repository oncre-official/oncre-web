import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import { changePinSchema } from "@/lib/validation/staff.schema";
import type { OncreUser } from "@/types/user";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireStaffSession();

    const body = await request.json();
    const parsed = changePinSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid PIN");

    const user = await staffBackendRequest<OncreUser>(session.token, "/users/update-pin", {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(user, "PIN changed successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

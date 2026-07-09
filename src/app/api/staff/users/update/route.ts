import { NextRequest } from "next/server";
import { z } from "zod";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";

/** Mirrors oncre-backend `UserDto` (src/app/user/dto/user.dto.ts) exactly, including its odd requirement to resupply role_id/password for a self profile update. */
const updateProfileSchema = z.object({
  countryCode: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  role_id: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireStaffSession();

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid profile details");

    await staffBackendRequest(session.token, "/users/update", { method: "PATCH", body: JSON.stringify(parsed.data) });

    return jsonSuccess(null, "Profile updated successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole, requireStaffSession } from "@/lib/server/staff-session";
import { ADMIN_USER_ROLES } from "@/lib/utils/staff-permissions";
import { adminCreateUserSchema } from "@/lib/validation/staff.schema";
import type { CreatedStaffUser } from "@/types/admin-user";
import type { ListResult } from "@/types/api";
import type { OncreUser } from "@/types/user";

/**
 * `GET admin/users` has no role restriction on the real backend at all
 * (only `JwtAuthGuard`) — this route intentionally mirrors that. The
 * console's own page still gates the whole Admin Users section to
 * admin/super-admin as a matter of product intent; see staff-permissions.ts.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<OncreUser>>(session.token, `/admin/users?${query}`);
    return jsonSuccess(result, "Staff users fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffRole(ADMIN_USER_ROLES);

    const body = await request.json();
    const parsed = adminCreateUserSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid user details");

    const { email, ...rest } = parsed.data;
    const payload = { ...rest, ...(email ? { email } : {}) };

    const created = await staffBackendRequest<CreatedStaffUser>(session.token, "/admin/user", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return jsonSuccess(created, "Staff user created successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}

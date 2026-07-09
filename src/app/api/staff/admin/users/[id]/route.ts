import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { ADMIN_USER_ROLES } from "@/lib/utils/staff-permissions";
import { adminCreateUserSchema } from "@/lib/validation/staff.schema";
import type { OncreUser } from "@/types/user";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Normalizes the backend's `POST admin/user/:id` (update) into a proper `PATCH`. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireStaffRole(ADMIN_USER_ROLES);
    const { id } = await params;

    const body = await request.json();
    const parsed = adminCreateUserSchema.partial().safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid user details");

    const updated = await staffBackendRequest<OncreUser>(session.token, `/admin/user/${id}`, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(updated, "Staff user updated successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

/** Normalizes the backend's `POST admin/user/delete/:id` into a proper `DELETE`. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaffRole(ADMIN_USER_ROLES);
    const { id } = await params;

    await staffBackendRequest(session.token, `/admin/user/delete/${id}`, { method: "POST" });

    return jsonSuccess(null, "Staff user deleted successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

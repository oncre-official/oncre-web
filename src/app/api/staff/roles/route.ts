import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import type { RoleWithPermissions } from "@/types/role";

export async function GET() {
  try {
    const session = await requireStaffSession();
    const roles = await staffBackendRequest<RoleWithPermissions[]>(session.token, "/roles");
    return jsonSuccess(roles, "Roles fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

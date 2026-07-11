import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { DASHBOARD_ROLES } from "@/lib/utils/staff-permissions";
import type { DashboardSummary } from "@/types/dashboard";

export async function GET() {
  try {
    const session = await requireStaffRole(DASHBOARD_ROLES);
    const result = await staffBackendRequest<DashboardSummary>(session.token, "/dashboard/summary");
    return jsonSuccess(result, "Dashboard summary fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

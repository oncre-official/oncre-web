import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import type { OncreUser } from "@/types/user";

export async function GET() {
  try {
    const session = await requireStaffSession();
    const profile = await staffBackendRequest<OncreUser>(session.token, "/users/profile");
    return jsonSuccess(profile, "Profile fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

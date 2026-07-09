import { jsonSuccess } from "@/lib/server/staff-http";
import { clearStaffSessionCookie } from "@/lib/server/staff-session";

export async function POST() {
  await clearStaffSessionCookie();
  return jsonSuccess(null, "Logged out.");
}

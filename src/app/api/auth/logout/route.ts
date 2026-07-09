import { jsonSuccess } from "@/lib/server/http";
import { clearSessionCookie } from "@/lib/server/session";

export async function POST() {
  await clearSessionCookie();
  return jsonSuccess(null, "Logged out.");
}

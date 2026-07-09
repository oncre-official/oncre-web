import { jsonSuccess } from "@/lib/server/staff-http";
import { getStaffSession } from "@/lib/server/staff-session";

/** Lets the client rehydrate its staff-session store on load without exposing the httpOnly cookie to JS. */
export async function GET() {
  const session = await getStaffSession();
  return jsonSuccess({ user: session?.user ?? null });
}

import { jsonSuccess } from "@/lib/server/http";
import { getCurrentAccount } from "@/lib/server/session";

/** Lets the client rehydrate its auth store on load without exposing the httpOnly session cookie to JS. */
export async function GET() {
  const account = await getCurrentAccount();
  return jsonSuccess({ account });
}

import { NextRequest } from "next/server";

import { BackendBusinessError, loginToBackend } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { setStaffSessionCookie } from "@/lib/server/staff-session";
import { loginSchema } from "@/lib/validation/auth.schema";

/** Staff console login — real oncre-backend `POST /auth/login`, separate identity from the merchant portal. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Enter your email/phone and password.");
    }

    const { user, token } = await loginToBackend(parsed.data.value, parsed.data.password);
    await setStaffSessionCookie({ token, user });

    // Strip the bcrypt hash the backend embeds on `user` before it ever reaches the browser.
    const { password, ...safeUser } = user as typeof user & { password?: string };
    void password;

    return jsonSuccess({ user: safeUser }, "Logged in successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

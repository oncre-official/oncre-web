import "server-only";

import { cookies } from "next/headers";

import { env } from "@/config/env";
import type { StaffSession } from "@/types/staff-auth";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export class StaffAuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 401,
  ) {
    super(message);
  }
}

/**
 * Real oncre-backend session for the staff console — a separate identity
 * system from the merchant portal's mock session (see `session.ts`). The
 * backend's login response embeds the bcrypt password hash on `user`
 * (confirmed against a live login); it is stripped here before the cookie
 * is ever written, even though the cookie is httpOnly.
 */
export async function setStaffSessionCookie(session: StaffSession): Promise<void> {
  const jar = await cookies();
  const { password, ...safeUser } = session.user as StaffSession["user"] & { password?: string };
  void password;
  const payload: StaffSession = { token: session.token, user: safeUser };

  jar.set(env.staffSessionCookieName, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearStaffSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(env.staffSessionCookieName);
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const raw = jar.get(env.staffSessionCookieName)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StaffSession;
  } catch {
    return null;
  }
}

export async function requireStaffSession(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) throw new StaffAuthError("Please log in to continue.", 401);
  return session;
}

/**
 * Cheap, UX-only pre-check against the role snapshot in the cookie — saves a
 * round trip and gives a consistent error shape before the real backend is
 * even called. The backend's own `RoleGuard` (fresh DB lookup per request)
 * remains the only real enforcement; every route handler must behave
 * correctly even if this check were bypassed entirely.
 */
export async function requireStaffRole(allowedRoles: readonly string[]): Promise<StaffSession> {
  const session = await requireStaffSession();
  const roleName = session.user.role?.name;
  if (!roleName || !allowedRoles.includes(roleName)) {
    throw new StaffAuthError("You do not have permission to access this resource.", 403);
  }
  return session;
}

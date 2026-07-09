import "server-only";

import { cookies } from "next/headers";

import { env } from "@/config/env";
import { PortalAccountStatus, PortalAccount } from "@/types/portal";

import { getAccountByToken, PortalError } from "./portal-store";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * The cookie carries `{ token, status }` rather than just an opaque token so
 * `middleware.ts` can guard `/dashboard` and `/onboarding/*` (AC-KAN-002,
 * AC-KAN-003) by reading the cookie alone — middleware may run on the Edge
 * runtime, which can't use the Node-only `crypto.scryptSync` the in-memory
 * portal store relies on for password hashing.
 */
interface SessionCookiePayload {
  token: string;
  status: PortalAccountStatus;
}

export async function setSessionCookie(token: string, status: PortalAccountStatus): Promise<void> {
  const jar = await cookies();
  const payload: SessionCookiePayload = { token, status };
  jar.set(env.sessionCookieName, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(env.sessionCookieName);
}

async function readSessionCookie(): Promise<SessionCookiePayload | null> {
  const jar = await cookies();
  const raw = jar.get(env.sessionCookieName)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionCookiePayload;
  } catch {
    return null;
  }
}

export async function getCurrentAccount(): Promise<PortalAccount | null> {
  const session = await readSessionCookie();
  if (!session) return null;
  const account = getAccountByToken(session.token);
  // Keep the cookie's status in sync in case it changed since the cookie was set.
  if (account && account.status !== session.status) await setSessionCookie(session.token, account.status);
  return account;
}

/** Rewrites the session cookie's status field in place, keyed off the currently-set token. */
export async function refreshSessionCookieStatus(status: PortalAccountStatus): Promise<void> {
  const session = await readSessionCookie();
  if (!session) return;
  await setSessionCookie(session.token, status);
}

export async function requireAccount(): Promise<PortalAccount> {
  const account = await getCurrentAccount();
  if (!account) throw new PortalError("Please log in to continue.", "UNAUTHENTICATED", 401);
  return account;
}

export async function requireActiveAccount(): Promise<PortalAccount> {
  const account = await requireAccount();
  if (account.status !== PortalAccountStatus.ACTIVE) {
    throw new PortalError("Activate your account to start recovering.", "NOT_ACTIVATED", 403);
  }
  return account;
}

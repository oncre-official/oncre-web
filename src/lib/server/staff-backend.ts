import "server-only";

import type { ApiEnvelope } from "@/types/api";
import type { OncreUser } from "@/types/user";

import { clearStaffSessionCookie } from "./staff-session";

/**
 * Server-only client for the staff console, authenticated per-request with
 * the CALLING STAFF USER's own token — unlike `backend-client.ts`, which
 * always uses one fixed service account for the merchant portal's
 * behind-the-scenes writes. This is what lets the real `RoleGuard` actually
 * differentiate between logged-in staff.
 */

const BACKEND_URL = process.env.ONCRE_BACKEND_URL ?? "http://localhost:3001/api/v1";

/** Guard denial — `JwtAuthGuard`/`RoleGuard` rejected the request. Body shape: `{statusCode, message, path}`. */
export class BackendAuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403,
  ) {
    super(message);
  }
}

/** A controller caught a business-logic exception itself — always HTTP 400, body `{success:false, message, data:null}`. */
export class BackendBusinessError extends Error {}

/** Network failure, timeout, or a response that isn't valid JSON in either known shape. */
export class BackendUnavailableError extends Error {}

interface GuardDenialBody {
  statusCode: number;
  message: string;
  path: string;
}

export async function loginToBackend(value: string, password: string): Promise<{ user: OncreUser; token: string }> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, password }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new BackendUnavailableError("Could not reach the recovery engine. Please try again.");
  }

  const body = (await res.json().catch(() => null)) as ApiEnvelope<{ user: OncreUser; token: string }> | null;

  if (res.status === 400 || !body) {
    throw new BackendBusinessError(body?.message ?? "Incorrect email or password.");
  }
  if (!res.ok) throw new BackendUnavailableError(`Login failed unexpectedly (${res.status}).`);

  return body.data;
}

/** Requires a token — never call this for the pre-auth login itself; use `loginToBackend`. */
export async function staffBackendRequest<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new BackendUnavailableError("Could not reach the recovery engine. Please try again.");
  }

  if (res.status === 401 || res.status === 403) {
    const body = (await res.json().catch(() => null)) as GuardDenialBody | null;
    if (res.status === 401) await clearStaffSessionCookie();
    throw new BackendAuthError(body?.message ?? "You do not have permission to access this resource.", res.status);
  }

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (res.status === 400 || !body) {
    throw new BackendBusinessError(body?.message ?? "That request could not be completed.");
  }
  if (!res.ok) throw new BackendUnavailableError(`Backend request failed (${res.status}).`);

  return body.data;
}

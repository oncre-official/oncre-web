import "server-only";

import type { ApiEnvelope, ListResult } from "@/types/api";
import type { Merchant } from "@/types/merchant";
import type { RegisterPortalAccountInput } from "@/types/portal";
import type { OncreUser } from "@/types/user";

/**
 * Server-only client for the real oncre-backend's self-serve merchant
 * identity endpoints (`/auth/register`, `/auth/verify-registration-otp`,
 * `/auth/login`) — now that they exist for real, the portal's own routes try
 * these FIRST. Unlike `staff-backend.ts`, callers only ever need to decide
 * one thing: fall back to the mock store, or don't. But that decision must
 * NOT be "any failure falls back" — if the backend is reachable and
 * genuinely rejects the request (e.g. duplicate email), falling back would
 * silently create a conflicting mock account instead of surfacing the real
 * error. `BackendResult` makes that distinction explicit.
 *
 * `post()` and `BackendResult` are generic enough that other server-only
 * clients (e.g. `fi-lead-client.ts`) reuse them for the same real-first,
 * fall-back-only-on-unreachable pattern against different backend routes.
 */

const BACKEND_URL = process.env.ONCRE_BACKEND_URL ?? "http://localhost:3001/api/v1";

export type BackendResult<T> =
  | { ok: true; data: T }
  /** Network error, timeout, or an unparseable response — safe to fall back to the mock store. */
  | { ok: false; unreachable: true }
  /** The backend was reached and explicitly rejected the request — surface `message`, do not fall back. */
  | { ok: false; unreachable: false; message: string };

interface RegisterResult {
  merchant_id: string;
  user_id: string;
  dev_otp?: string;
}

interface AuthResult {
  user: OncreUser;
  token: string;
}

export async function post<T>(path: string, body: unknown, token?: string): Promise<BackendResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, unreachable: true };
  }

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!envelope) return { ok: false, unreachable: true };
  if (!res.ok || !envelope.success) {
    return { ok: false, unreachable: false, message: envelope.message ?? "The request could not be completed." };
  }

  return { ok: true, data: envelope.data };
}

export function registerWithBackend(input: RegisterPortalAccountInput): Promise<BackendResult<RegisterResult>> {
  return post<RegisterResult>("/auth/register", {
    full_name: input.full_name,
    business_name: input.business_name,
    business_type: input.business_type,
    email: input.email,
    phone: input.phone,
    password: input.password,
  });
}

export function verifyBackendOtp(value: string, otp: string): Promise<BackendResult<AuthResult>> {
  return post<AuthResult>("/auth/verify-registration-otp", { value, otp });
}

export function loginWithBackend(value: string, password: string): Promise<BackendResult<AuthResult>> {
  return post<AuthResult>("/auth/login", { value, password });
}

export function initiateRealActivation(token: string, callbackUrl: string): Promise<BackendResult<{ payment_url: string; reference: string }>> {
  return post<{ payment_url: string; reference: string }>("/payments/activation/initiate", { callback_url: callbackUrl }, token);
}

export function verifyRealActivation(token: string, reference: string): Promise<BackendResult<{ activated: boolean }>> {
  return post<{ activated: boolean }>("/payments/activation/verify", { reference }, token);
}

/** Any authenticated user can call `GET /merchants` — used here to fetch the caller's own linked Merchant record. */
export async function fetchMerchantForUser(token: string, userId: string): Promise<Merchant | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/merchants?user_id=${encodeURIComponent(userId)}&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });

    const envelope = (await res.json().catch(() => null)) as ApiEnvelope<ListResult<Merchant>> | null;
    if (!res.ok || !envelope?.success) return null;
    return envelope.data.row[0] ?? null;
  } catch {
    return null;
  }
}

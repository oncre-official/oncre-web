import { ApiEnvelope, ApiError } from "@/types/api";

/**
 * `new URLSearchParams(params)` stringifies `undefined`/`null` values as the
 * literal text "undefined"/"null" instead of omitting the key — silently
 * sends e.g. `status=undefined` as a real filter value. Always build list
 * query strings through this instead of the bare constructor.
 */
export function toQueryString(params: object): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  ) as [string, string][];
  return new URLSearchParams(entries).toString();
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

/** Thin fetch wrapper for our own `/api/*` route handlers — always same-origin, always cookie-based auth. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? "GET",
    credentials: "same-origin",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !envelope || !envelope.success) {
    throw new ApiError(envelope?.message ?? "Something went wrong. Please try again.", res.status);
  }

  return envelope.data;
}

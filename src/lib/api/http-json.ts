import { ApiEnvelope, ApiError } from "@/types/api";

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

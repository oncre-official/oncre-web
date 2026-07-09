import "server-only";

import type { ApiEnvelope, ListResult } from "@/types/api";
import type { Call } from "@/types/call";
import type { Case, CreateCaseInput } from "@/types/case";
import type { CreateMerchantInput, Merchant } from "@/types/merchant";
import type { Message } from "@/types/message";
import type { Payment } from "@/types/payment";

/**
 * Server-only proxy to the real oncre-backend NestJS API, authenticated with a
 * privileged service account (never exposed to the browser). This is what
 * "wiring the real backend" means for entities the self-serve portal doesn't
 * own directly (Cases, Merchants) — see docs/BACKEND_INTEGRATION.md for why
 * the portal's own identity (register/OTP/login) cannot go through here.
 *
 * If `ONCRE_SERVICE_ACCOUNT_EMAIL`/`ONCRE_SERVICE_ACCOUNT_PASSWORD` are not
 * configured, or the backend is unreachable, `getBackendClient()` returns
 * `null` and callers fall back to the local mock store.
 */

const BACKEND_URL = process.env.ONCRE_BACKEND_URL ?? "http://localhost:3001/api/v1";
const SERVICE_EMAIL = process.env.ONCRE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_PASSWORD = process.env.ONCRE_SERVICE_ACCOUNT_PASSWORD;

export class BackendUnavailableError extends Error {}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function login(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: SERVICE_EMAIL, password: SERVICE_PASSWORD }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new BackendUnavailableError(`Service-account login failed (${res.status})`);

  const body = (await res.json()) as ApiEnvelope<{ token: string }>;
  cachedToken = { token: body.data.token, expiresAt: Date.now() + 10 * 60 * 1000 };
  return cachedToken.token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await login();

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    signal: AbortSignal.timeout(8000),
  });

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !body) {
    throw new BackendUnavailableError(body?.message ?? `Backend request failed (${res.status})`);
  }

  return body.data;
}

export interface BackendClient {
  findOrCreateMerchant(input: CreateMerchantInput): Promise<Merchant>;
  createCase(input: CreateCaseInput): Promise<Case>;
  listCases(filter: { merchant_id?: string }): Promise<Case[]>;
  listCalls(case_id: string): Promise<Call[]>;
  listMessages(case_id: string): Promise<Message[]>;
  listPayments(case_id: string): Promise<Payment[]>;
}

/**
 * Returns a working client, or `null` if the service account isn't
 * configured. Individual calls can still throw `BackendUnavailableError` if
 * the backend is unreachable — callers should catch that and fall back.
 */
export function getBackendClient(): BackendClient | null {
  if (!SERVICE_EMAIL || !SERVICE_PASSWORD) return null;

  return {
    async findOrCreateMerchant(input) {
      return request<Merchant>("/merchants", { method: "POST", body: JSON.stringify(input) });
    },
    async createCase(input) {
      return request<Case>("/cases", { method: "POST", body: JSON.stringify(input) });
    },
    async listCases(filter) {
      const params = new URLSearchParams();
      if (filter.merchant_id) params.set("merchant_id", filter.merchant_id);
      params.set("limit", "200");
      const result = await request<ListResult<Case>>(`/cases?${params.toString()}`);
      return result.row;
    },
    async listCalls(case_id) {
      const result = await request<ListResult<Call>>(`/calls?case_id=${encodeURIComponent(case_id)}`);
      return result.row;
    },
    async listMessages(case_id) {
      const result = await request<ListResult<Message>>(`/messages?case_id=${encodeURIComponent(case_id)}`);
      return result.row;
    },
    async listPayments(case_id) {
      const result = await request<ListResult<Payment>>(`/payments?case_id=${encodeURIComponent(case_id)}`);
      return result.row;
    },
  };
}

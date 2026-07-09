import { NextRequest } from "next/server";

import { createSession, getAccountByEmail, login, PortalError, upsertBackendShadowAccount } from "@/lib/server/portal-store";
import { fetchMerchantForUser, loginWithBackend } from "@/lib/server/real-auth-client";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/session";
import { loginSchema } from "@/lib/validation/auth.schema";
import { BusinessType, PortalAccountStatus } from "@/types/portal";

/**
 * Portal login. Tries the real backend's `POST /auth/login` first — this is
 * what lets a merchant who registered for real log back in even after
 * `oncre-web`'s dev server restarts (Mongo persists, the mock store doesn't).
 * Falls back to the mock store only when the backend is unreachable; a
 * reachable backend that rejects the credentials means exactly that —
 * surfaced directly, not silently retried against the mock.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new PortalError(parsed.error.issues[0]?.message ?? "Invalid credentials", "VALIDATION_ERROR", 400);
    }

    const { value, password } = parsed.data;
    const real = await loginWithBackend(value, password);

    if (real.ok) {
      const { user, token: backendToken } = real.data;
      const existingShadow = getAccountByEmail(user.email ?? "");
      const merchant = await fetchMerchantForUser(backendToken, user._id);

      if (!existingShadow && !merchant) {
        throw new PortalError("We couldn't load your merchant profile. Please try again.", "MERCHANT_NOT_FOUND", 404);
      }

      // `merchant.activated` in Mongo is the source of truth for payment status —
      // never just trust the shadow's cached status, which is wiped on every
      // process restart and would otherwise report a paid merchant as unpaid.
      const status = merchant?.activated
        ? PortalAccountStatus.ACTIVE
        : (existingShadow?.status ?? PortalAccountStatus.VERIFIED_PENDING_PAYMENT);

      const account = {
        merchant_id: merchant?.merchant_id ?? existingShadow!.merchant_id,
        full_name: merchant?.merchant_name ?? existingShadow?.full_name ?? user.email ?? "",
        business_name: merchant?.merchant_store_name ?? existingShadow?.business_name ?? "",
        business_type: (merchant?.business_type as BusinessType) ?? existingShadow?.business_type ?? BusinessType.OTHER,
        email: user.email ?? existingShadow?.email ?? value,
        phone: user.phone ?? existingShadow?.phone ?? "",
        status,
        created_at: existingShadow?.created_at ?? new Date().toISOString(),
        activated_at: merchant?.activated_at ?? existingShadow?.activated_at,
      };

      upsertBackendShadowAccount(account, backendToken);

      const sessionToken = createSession(account.merchant_id);
      await setSessionCookie(sessionToken, account.status);

      return jsonSuccess({ account }, "Logged in successfully.");
    }

    if (!real.unreachable) {
      throw new PortalError(real.message, "BACKEND_REJECTED", 400);
    }

    const { account, token } = login(value, password);
    await setSessionCookie(token, account.status);

    return jsonSuccess({ account }, "Logged in successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonSuccess } from "@/lib/server/http";
import { completeActivation, getBackendToken, markAccountActivated, PortalError } from "@/lib/server/portal-store";
import { verifyRealActivation } from "@/lib/server/real-auth-client";
import { refreshSessionCookieStatus, requireAccount } from "@/lib/server/session";
import { PortalAccountStatus } from "@/types/portal";

const bodySchema = z.object({ reference: z.string().min(1) });

/**
 * PRD 2.4.3 payment confirmation. Serves two callers: the "Simulate payment"
 * button (mock accounts, no `backend_token`) and the real Paystack-return
 * callback page (`/onboarding/activate/callback`) for real accounts. A real
 * account calls the real backend's synchronous verify endpoint directly
 * (`GET /transaction/verify/:reference` under the hood) rather than waiting
 * on Paystack's webhook — Paystack's webhook can't reach `localhost` at all,
 * so this is the path that actually works in local dev, and it's harmless to
 * also keep in production since both paths funnel through the same
 * idempotent completion logic on the backend.
 */
export async function POST(request: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new PortalError("Missing payment reference", "VALIDATION_ERROR", 400);

    const token = getBackendToken(account.merchant_id);

    if (token) {
      const real = await verifyRealActivation(token, parsed.data.reference);
      if (!real.ok) {
        const message = real.unreachable ? "Could not reach the payment gateway. Please try again." : real.message;
        throw new PortalError(message, "PAYMENT_VERIFY_FAILED", real.unreachable ? 503 : 400);
      }

      if (!real.data.activated) {
        return jsonSuccess({ activated: false }, "Payment not yet completed.");
      }

      const updated = markAccountActivated(account.merchant_id);
      await refreshSessionCookieStatus(PortalAccountStatus.ACTIVE);

      return jsonSuccess({ activated: true, account: updated }, "Payment confirmed. Account activated.");
    }

    const mockAccount = completeActivation(parsed.data.reference);
    await refreshSessionCookieStatus(mockAccount.status);

    return jsonSuccess({ activated: true, account: mockAccount }, "Payment confirmed. Account activated.");
  } catch (error) {
    return jsonError(error);
  }
}

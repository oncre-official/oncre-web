import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/server/http";
import { getBackendToken, initiateActivation, PortalError } from "@/lib/server/portal-store";
import { initiateRealActivation } from "@/lib/server/real-auth-client";
import { requireAccount } from "@/lib/server/session";

/**
 * PRD 2.4.3 `POST /api/payments/initiate` — the ₦5,000 activation paywall.
 * A real account (one with a stashed `backend_token`) always goes through the
 * real Paystack checkout via oncre-backend; a real account never falls back
 * to the mock path — a failure here is a genuine error, not something to
 * silently paper over with a fake payment. Only accounts with no backend
 * token (pure mock, pre-dating real registration) use the old simulated flow.
 */
export async function POST(request: NextRequest) {
  try {
    const account = await requireAccount();
    const token = getBackendToken(account.merchant_id);

    if (token) {
      const callbackUrl = `${request.nextUrl.origin}/onboarding/activate/callback`;
      const real = await initiateRealActivation(token, callbackUrl);

      if (!real.ok) {
        const message = real.unreachable ? "Could not reach the payment gateway. Please try again." : real.message;
        throw new PortalError(message, "PAYMENT_INIT_FAILED", real.unreachable ? 503 : 400);
      }

      return jsonSuccess(
        { reference: real.data.reference, payment_url: real.data.payment_url, amount_kobo: 500_000, currency: "NGN" },
        "Payment initialised.",
      );
    }

    const { reference, amount_kobo } = initiateActivation(account.merchant_id);

    return jsonSuccess({ reference, amount_kobo, currency: "NGN" }, "Payment initialised.");
  } catch (error) {
    return jsonError(error);
  }
}

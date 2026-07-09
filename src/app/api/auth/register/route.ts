import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/server/http";
import { PortalError, registerAccount, upsertBackendShadowAccount } from "@/lib/server/portal-store";
import { registerWithBackend } from "@/lib/server/real-auth-client";
import { registerSchema } from "@/lib/validation/auth.schema";
import { PortalAccountStatus } from "@/types/portal";

/**
 * PRD 2.4.2 `POST /api/auth/register`. Now that a real
 * `POST /api/v1/auth/register` exists on oncre-backend, this tries that
 * first — on success the account is a real `User`+`Merchant` in MongoDB.
 * Only falls back to the local mock store if the backend is unreachable; if
 * it's reachable and rejects the request (e.g. duplicate email), that error
 * is surfaced directly — silently falling back there would create a
 * conflicting mock account behind a real one. See docs/BACKEND_INTEGRATION.md.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new PortalError(parsed.error.issues[0]?.message ?? "Invalid registration details", "VALIDATION_ERROR", 400);
    }

    const real = await registerWithBackend(parsed.data);

    if (real.ok) {
      upsertBackendShadowAccount({
        merchant_id: real.data.merchant_id,
        full_name: parsed.data.full_name,
        business_name: parsed.data.business_name,
        business_type: parsed.data.business_type,
        email: parsed.data.email,
        phone: parsed.data.phone,
        status: PortalAccountStatus.PENDING_PAYMENT,
        created_at: new Date().toISOString(),
      });

      if (real.data.dev_otp) console.info(`[real-backend-otp] OTP for ${real.data.merchant_id}: ${real.data.dev_otp}`);

      return jsonSuccess(
        { merchant_id: real.data.merchant_id, dev_otp: real.data.dev_otp },
        "Account created. Verification code sent.",
        201,
      );
    }

    if (!real.unreachable) {
      throw new PortalError(real.message, "BACKEND_REJECTED", 400);
    }

    const { account, otp } = registerAccount(parsed.data);

    console.info(`[mock-otp] OTP for ${account.merchant_id}: ${otp}`);

    return jsonSuccess(
      { merchant_id: account.merchant_id, dev_otp: otp },
      "Account created. Verification code sent.",
      201,
    );
  } catch (error) {
    return jsonError(error);
  }
}

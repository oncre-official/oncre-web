import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonSuccess } from "@/lib/server/http";
import { createSession, getAccountById, PortalError, upsertBackendShadowAccount, verifyOtp } from "@/lib/server/portal-store";
import { verifyBackendOtp } from "@/lib/server/real-auth-client";
import { setSessionCookie } from "@/lib/server/session";
import { otpSchema } from "@/lib/validation/auth.schema";
import { PortalAccountStatus } from "@/types/portal";

const bodySchema = otpSchema.extend({ merchant_id: z.string().min(1) });

/**
 * PRD 2.4.2 `POST /api/auth/verify-otp`. A `MER-` prefixed `merchant_id`
 * means registration went through the real backend (see `/api/auth/register`)
 * — verify against the real `/auth/verify-registration-otp` instead of the
 * mock store. Either way, the portal's own session cookie always carries its
 * own opaque token, not the real JWT — but for a real account the real JWT is
 * stashed server-side (`upsertBackendShadowAccount`'s second arg) so later
 * server-side calls (the activation payment) can act as this merchant.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new PortalError(parsed.error.issues[0]?.message ?? "Invalid code", "VALIDATION_ERROR", 400);
    }

    const { merchant_id, otp_code } = parsed.data;

    if (merchant_id.startsWith("MER-")) {
      const shadow = getAccountById(merchant_id);
      if (!shadow) throw new PortalError("Account not found.", "ACCOUNT_NOT_FOUND", 404);

      const result = await verifyBackendOtp(shadow.email, otp_code);
      if (!result.ok) {
        const message = result.unreachable ? "Could not reach the recovery engine. Please try again." : result.message;
        throw new PortalError(message, "OTP_INVALID", 400);
      }

      const updated = { ...shadow, status: PortalAccountStatus.VERIFIED_PENDING_PAYMENT };
      upsertBackendShadowAccount(updated, result.data.token);

      const token = createSession(merchant_id);
      await setSessionCookie(token, updated.status);

      return jsonSuccess({ account: updated }, "Phone number verified.");
    }

    const account = verifyOtp(merchant_id, otp_code);
    const token = createSession(account.merchant_id);
    await setSessionCookie(token, account.status);

    return jsonSuccess({ account }, "Phone number verified.");
  } catch (error) {
    return jsonError(error);
  }
}

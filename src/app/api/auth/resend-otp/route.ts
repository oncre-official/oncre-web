import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonSuccess } from "@/lib/server/http";
import { PortalError, resendOtp } from "@/lib/server/portal-store";

const bodySchema = z.object({ merchant_id: z.string().min(1) });

/** PRD 2.3 step 18 — "Resend available after 60-second cooldown." */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new PortalError("merchant_id is required", "VALIDATION_ERROR", 400);

    const otp = resendOtp(parsed.data.merchant_id);
    console.info(`[mock-otp] Resent OTP for ${parsed.data.merchant_id}: ${otp}`);

    return jsonSuccess({ dev_otp: otp }, "Verification code resent.");
  } catch (error) {
    return jsonError(error);
  }
}

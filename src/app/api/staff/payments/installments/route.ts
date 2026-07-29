import { NextRequest } from "next/server";

import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { PAYMENT_VIEW_ROLES } from "@/lib/utils/staff-permissions";
import type { PaymentInstallment } from "@/types/payment";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffRole(PAYMENT_VIEW_ROLES);
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<PaymentInstallment[]>(session.token, `/payments/installments?${query}`);
    return jsonSuccess(result, "Installments fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

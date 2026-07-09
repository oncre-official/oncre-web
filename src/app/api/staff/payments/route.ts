import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole, requireStaffSession } from "@/lib/server/staff-session";
import { PAYMENT_PLAN_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import { createPaymentPlanSchema } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Payment } from "@/types/payment";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<Payment>>(session.token, `/payments?${query}`);
    return jsonSuccess(result, "Payments fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffRole(PAYMENT_PLAN_CREATE_ROLES);

    const body = await request.json();
    const parsed = createPaymentPlanSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid payment plan details");

    const payment = await staffBackendRequest<Payment>(session.token, "/payments", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(payment, "Payment plan created successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}

import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole, requireStaffSession } from "@/lib/server/staff-session";
import { MERCHANT_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import { createMerchantSchema } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Merchant } from "@/types/merchant";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<Merchant>>(session.token, `/merchants?${query}`);
    return jsonSuccess(result, "Merchants fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffRole(MERCHANT_CREATE_ROLES);

    const body = await request.json();
    const parsed = createMerchantSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid merchant details");

    const merchant = await staffBackendRequest<Merchant>(session.token, "/merchants", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(merchant, "Merchant created successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}

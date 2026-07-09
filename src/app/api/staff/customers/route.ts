import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole, requireStaffSession } from "@/lib/server/staff-session";
import { MERCHANT_CUSTOMER_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import { createCustomerSchema } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Customer } from "@/types/customer";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<Customer>>(session.token, `/customers?${query}`);
    return jsonSuccess(result, "Customers fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffRole(MERCHANT_CUSTOMER_CREATE_ROLES);

    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid customer details");

    const customer = await staffBackendRequest<Customer>(session.token, "/customers", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(customer, "Customer created successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}

import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { MERCHANT_CUSTOMER_DEACTIVATE_ROLES } from "@/lib/utils/staff-permissions";
import type { Customer } from "@/types/customer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaffRole(MERCHANT_CUSTOMER_DEACTIVATE_ROLES);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const customer = await staffBackendRequest<Customer>(session.token, `/customers/${id}/clear-cash-only`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return jsonSuccess(customer, "Cash-only restriction cleared.");
  } catch (error) {
    return jsonError(error);
  }
}

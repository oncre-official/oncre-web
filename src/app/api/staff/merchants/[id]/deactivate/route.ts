import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { MERCHANT_CUSTOMER_DEACTIVATE_ROLES } from "@/lib/utils/staff-permissions";
import type { Merchant } from "@/types/merchant";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaffRole(MERCHANT_CUSTOMER_DEACTIVATE_ROLES);
    const { id } = await params;

    const merchant = await staffBackendRequest<Merchant>(session.token, `/merchants/${id}/deactivate`, {
      method: "PATCH",
    });

    return jsonSuccess(merchant, "Merchant deactivated successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

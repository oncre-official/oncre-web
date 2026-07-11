import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import type { Merchant } from "@/types/merchant";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaffSession();
    const { id } = await params;

    const merchant = await staffBackendRequest<Merchant>(session.token, `/merchants/${id}`);

    return jsonSuccess(merchant, "Merchant fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

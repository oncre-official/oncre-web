import { staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffSession } from "@/lib/server/staff-session";
import type { DebtorRestriction } from "@/types/customer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaffSession();
    const { id } = await params;

    const restrictions = await staffBackendRequest<DebtorRestriction[]>(session.token, `/customers/${id}/restrictions`);

    return jsonSuccess(restrictions, "Restriction history fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

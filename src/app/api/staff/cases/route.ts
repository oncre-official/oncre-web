import { NextRequest } from "next/server";

import { BackendBusinessError, staffBackendRequest } from "@/lib/server/staff-backend";
import { jsonError, jsonSuccess } from "@/lib/server/staff-http";
import { requireStaffRole } from "@/lib/server/staff-session";
import { CASE_CREATE_ROLES, CASE_LIST_ROLES } from "@/lib/utils/staff-permissions";
import { createCaseSchema } from "@/lib/validation/staff.schema";
import type { ListResult } from "@/types/api";
import type { Case } from "@/types/case";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffRole(CASE_LIST_ROLES);
    const query = request.nextUrl.searchParams.toString();
    const result = await staffBackendRequest<ListResult<Case>>(session.token, `/cases?${query}`);
    return jsonSuccess(result, "Cases fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffRole(CASE_CREATE_ROLES);

    const body = await request.json();
    const parsed = createCaseSchema.safeParse(body);
    if (!parsed.success) throw new BackendBusinessError(parsed.error.issues[0]?.message ?? "Invalid case details");

    const caze = await staffBackendRequest<Case>(session.token, "/cases", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    return jsonSuccess(caze, "Case created successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}

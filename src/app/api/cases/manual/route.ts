import { NextRequest } from "next/server";

import { ingestDebtorRecord } from "@/lib/server/case-ingestion";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { addCases, PortalError } from "@/lib/server/portal-store";
import { requireActiveAccount } from "@/lib/server/session";
import { debtorRecordSchema } from "@/lib/validation/debtor-row.schema";

/** PRD 2.4.5 `POST /api/cases/manual` — single-debtor ad-hoc entry (Sub-flow C, manual path). */
export async function POST(request: NextRequest) {
  try {
    const account = await requireActiveAccount();

    const body = await request.json();
    const parsed = debtorRecordSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new PortalError(issue?.message ?? "Invalid debtor details", "VALIDATION_ERROR", 400);
    }

    const caze = await ingestDebtorRecord(account, parsed.data);
    addCases(account.merchant_id, [caze]);

    return jsonSuccess(caze, "Case created successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}

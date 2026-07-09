import { NextRequest } from "next/server";
import { z } from "zod";

import { ingestDebtorRecord } from "@/lib/server/case-ingestion";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { generateJobId } from "@/lib/server/id";
import { addCases, createBulkJob, PortalError } from "@/lib/server/portal-store";
import { requireActiveAccount } from "@/lib/server/session";
import { CSV_REQUIRED_COLUMNS, debtorRecordSchema } from "@/lib/validation/debtor-row.schema";

const bodySchema = z.object({
  rows: z.array(z.record(z.string(), z.string())).max(500, "A single upload can contain at most 500 rows"),
});

/**
 * PRD 2.4.5 `POST /api/cases/bulk-upload`. The CSV itself is parsed
 * client-side with PapaParse (per 1.4.1) for instant preview; this endpoint
 * re-validates every row authoritatively before committing anything, and
 * responds with the same `{total, valid, invalid, cases_created,
 * error_report_url}` shape the PRD specifies (via a persisted job record
 * instead of an actual async queue, since processing here is fast enough to
 * finish synchronously).
 */
export async function POST(request: NextRequest) {
  try {
    const account = await requireActiveAccount();

    const body = await request.json();
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
      throw new PortalError(parsedBody.error.issues[0]?.message ?? "Invalid upload payload", "VALIDATION_ERROR", 400);
    }

    const { rows } = parsedBody.data;
    if (rows.length === 0) throw new PortalError("The uploaded file has no data rows.", "EMPTY_FILE", 400);

    const headers = Object.keys(rows[0]);
    const missingColumns = CSV_REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new PortalError(
        `Missing required column: ${missingColumns[0]}. Please use the Oncre CSV template.`,
        "MISSING_COLUMN",
        400,
      );
    }

    const errors: { row: number; column: string; message: string }[] = [];
    const validRecords: { rowNumber: number; record: z.infer<typeof debtorRecordSchema> }[] = [];

    rows.forEach((row, index) => {
      const result = debtorRecordSchema.safeParse(row);
      if (result.success) {
        validRecords.push({ rowNumber: index + 1, record: result.data });
      } else {
        for (const issue of result.error.issues) {
          errors.push({ row: index + 1, column: String(issue.path[0] ?? ""), message: issue.message });
        }
      }
    });

    const casesCreated = await Promise.all(validRecords.map(({ record }) => ingestDebtorRecord(account, record)));
    addCases(account.merchant_id, casesCreated);

    const job = {
      job_id: generateJobId(),
      merchant_id: account.merchant_id,
      total: rows.length,
      valid: validRecords.length,
      invalid: rows.length - validRecords.length,
      cases_created: casesCreated,
      errors,
      created_at: Date.now(),
    };
    createBulkJob(job);

    return jsonSuccess(
      {
        job_id: job.job_id,
        total: job.total,
        valid: job.valid,
        invalid: job.invalid,
        cases_created: job.cases_created,
        errors: job.errors,
      },
      `${job.valid} cases created successfully.`,
      202,
    );
  } catch (error) {
    return jsonError(error);
  }
}

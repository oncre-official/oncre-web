import "server-only";

import { BackendUnavailableError, getBackendClient } from "@/lib/server/backend-client";
import { generateOncCaseId } from "@/lib/server/id";
import { recordBackendMerchantId } from "@/lib/server/portal-store";
import { Case, CaseStatus } from "@/types/case";
import { PortalAccount, DebtorRecordInput, SourcedCase } from "@/types/portal";
import { toE164Nigerian } from "@/lib/utils/phone";

/**
 * Turns a validated debtor record into a Case, preferring the real backend
 * (`POST /api/v1/merchants` + `POST /api/v1/cases`) and transparently falling
 * back to a locally-minted `ONC-XXXXXX` record when the backend/service
 * account isn't configured or reachable. See docs/BACKEND_INTEGRATION.md.
 *
 * A `MER-` prefixed `account.merchant_id` means this account is a real,
 * backend-registered Merchant (see the real self-serve registration flow) —
 * pass it straight through so the backend attaches the case to that exact
 * Merchant. Without it, the backend would have to re-resolve a merchant by
 * `merchant_name`/`merchant_phone`, which risks creating a second, duplicate
 * Merchant record for an account that already has a real one. A `PMER-`
 * prefixed id (mock-only account, pre-dating real registration) has no real
 * Merchant to link to, so it keeps using the name/phone lookup — the
 * mechanism that bridges a mock identity into the real backend at all.
 */
export async function ingestDebtorRecord(account: PortalAccount, record: DebtorRecordInput): Promise<SourcedCase> {
  const client = getBackendClient();

  if (client) {
    try {
      const created = await client.createCase({
        ...(account.merchant_id.startsWith("MER-") ? { merchant_id: account.merchant_id } : {}),
        merchant_name: account.full_name,
        merchant_phone: toE164Nigerian(account.phone),
        debtor_name: record.debtor_full_name,
        debtor_phone: toE164Nigerian(record.debtor_phone),
        wholesaler_name: record.business_name,
        amount: record.amount_owed_ngn,
        description: record.notes,
        due_date: record.debt_date,
      });
      recordBackendMerchantId(account.merchant_id, created.merchant_id);
      return { ...created, source: "backend" };
    } catch (error) {
      if (!(error instanceof BackendUnavailableError)) throw error;
      // fall through to the local mock record below
    }
  }

  return buildMockCase(account, record);
}

function buildMockCase(account: PortalAccount, record: DebtorRecordInput): SourcedCase {
  const now = new Date();
  const caze: Case = {
    _id: crypto.randomUUID(),
    case_id: generateOncCaseId(),
    merchant_id: account.merchant_id,
    debtor_name: record.debtor_full_name,
    debtor_phone: record.debtor_phone,
    wholesaler_name: record.business_name,
    amount: record.amount_owed_ngn,
    description: record.notes,
    due_date: record.debt_date,
    status: CaseStatus.ACTIVE,
    escalation_level: 1,
    current_day: 0,
    is_paused: false,
    activated_at: now.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  return { ...caze, source: "mock" };
}

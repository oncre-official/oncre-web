import { BackendUnavailableError, getBackendClient } from "@/lib/server/backend-client";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { getBackendMerchantId, listCases } from "@/lib/server/portal-store";
import { requireActiveAccount } from "@/lib/server/session";
import { SourcedCase } from "@/types/portal";

/**
 * PRD 2.4.6 `GET /api/cases` (scoped here to `/api/merchant/cases` since the
 * portal has no bearer-token session the real backend would recognise).
 * Combines whatever was actually persisted to the real backend (tagged
 * `source: "backend"`) with anything that fell back to the local store
 * (`source: "mock"`) so the Kanban always reflects the truth of where data
 * lives — see docs/BACKEND_INTEGRATION.md.
 */
export async function GET() {
  try {
    const account = await requireActiveAccount();

    const mockCases = listCases(account.merchant_id);

    let backendCases: SourcedCase[] = [];
    const backendMerchantId = getBackendMerchantId(account.merchant_id);
    const client = getBackendClient();

    if (client && backendMerchantId) {
      try {
        const cases = await client.listCases({ merchant_id: backendMerchantId });
        backendCases = cases.map((c) => ({ ...c, source: "backend" as const }));
      } catch (error) {
        if (!(error instanceof BackendUnavailableError)) throw error;
      }
    }

    const merged = [...backendCases, ...mockCases.filter((m) => !backendCases.some((b) => b.case_id === m.case_id))];
    merged.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

    return jsonSuccess(merged, "Cases fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

import { BackendUnavailableError, getBackendClient } from "@/lib/server/backend-client";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { synthesizeMockTimeline } from "@/lib/server/mock-timeline";
import { findCase, PortalError } from "@/lib/server/portal-store";
import { requireActiveAccount } from "@/lib/server/session";
import type { Call } from "@/types/call";
import type { Message } from "@/types/message";
import type { Payment } from "@/types/payment";

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

/**
 * PRD 2.4.6 `GET /api/cases/:caseId` — full case timeline, communications and
 * payment status for the slide-over panel (2.3 step 33). For cases persisted
 * to the real backend, this composes the real `GET /calls`, `GET /messages`
 * and `GET /payments` endpoints filtered by `case_id`; there is no single
 * "case detail" endpoint on the backend today, only these three list views.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const account = await requireActiveAccount();
    const { caseId } = await params;

    const caze = findCase(account.merchant_id, caseId);
    if (!caze) throw new PortalError("Case not found.", "CASE_NOT_FOUND", 404);

    let calls: Call[] = [];
    let messages: Message[] = [];
    let payments: Payment[] = [];

    if (caze.source === "backend") {
      const client = getBackendClient();
      try {
        if (client) {
          [calls, messages, payments] = await Promise.all([
            client.listCalls(caze.case_id),
            client.listMessages(caze.case_id),
            client.listPayments(caze.case_id),
          ]);
        }
      } catch (error) {
        if (!(error instanceof BackendUnavailableError)) throw error;
      }
    } else {
      const synthesized = synthesizeMockTimeline(caze);
      calls = synthesized.calls;
      messages = synthesized.messages;
    }

    return jsonSuccess({ case: caze, calls, messages, payments }, "Case detail fetched successfully.");
  } catch (error) {
    return jsonError(error);
  }
}

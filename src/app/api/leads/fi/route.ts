import { NextRequest } from "next/server";

import { submitFiLeadToBackend } from "@/lib/server/fi-lead-client";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { checkFiLeadRateLimit, createFiLead, isFreeEmailDomain, PortalError } from "@/lib/server/portal-store";
import { fiLeadSchema } from "@/lib/validation/fi-lead.schema";

/**
 * PRD Module 1, section 1.4.3. Tries the real `POST /leads/fi` on
 * oncre-backend first — on success the lead is a real `fi_leads` Mongo
 * document, not just in-memory. Falls back to the mock store only when the
 * backend is unreachable; a reachable backend that rejects the request (e.g.
 * its own server-side free-email-domain check) is surfaced directly, not
 * silently retried against the mock. CRM webhook / SendGrid / Slack dispatch
 * (1.4.4) are still not wired up — third-party integrations left as future work.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    checkFiLeadRateLimit(ip);

    const body = await request.json();
    const parsed = fiLeadSchema.safeParse(body);
    if (!parsed.success) {
      throw new PortalError(parsed.error.issues[0]?.message ?? "Invalid submission", "VALIDATION_ERROR", 400);
    }

    const { website: honeypot, ...input } = parsed.data;
    if (isFreeEmailDomain(input.work_email)) {
      throw new PortalError("Please use your institutional email address.", "FREE_EMAIL_DOMAIN", 400);
    }

    const botSuspected = Boolean(honeypot);

    const real = await submitFiLeadToBackend({ ...input, bot_suspected: botSuspected });

    if (real.ok) {
      return jsonSuccess(real.data, "Lead captured successfully.", 201);
    }

    if (!real.unreachable) {
      throw new PortalError(real.message, "BACKEND_REJECTED", 400);
    }

    const lead = createFiLead(input, botSuspected);

    return jsonSuccess(lead, "Lead captured successfully.", 201);
  } catch (error) {
    return jsonError(error);
  }
}
